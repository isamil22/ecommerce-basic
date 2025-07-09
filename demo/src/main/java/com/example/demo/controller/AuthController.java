package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.User;
import com.example.demo.service.JwtService;
import com.example.demo.service.RecaptchaService;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final RecaptchaService recaptchaService; // Injected RecaptchaService

    /**
     * Handles user login requests.
     * Validates the reCAPTCHA token, authenticates the user, and returns a JWT token upon success.
     *
     * @param loginRequest The login request containing email, password, and reCAPTCHA token.
     * @return A ResponseEntity containing the JWT token or an error message.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest){
        // Validate the reCAPTCHA token first
        if (!recaptchaService.validateRecaptcha(loginRequest.getRecaptchaToken())) {
            logger.warn("reCAPTCHA validation failed for login attempt with email: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("reCAPTCHA validation failed.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            final UserDetails userDetails = userService.getUserByEmail(loginRequest.getEmail());
            final String jwt = jwtService.generateToken(userDetails);
            return ResponseEntity.ok(jwt);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    /**
     * Handles new user registration requests.
     * Validates the reCAPTCHA token before creating a new user.
     *
     * @param request The registration request containing user details and a reCAPTCHA token.
     * @return A ResponseEntity with the registered user's details or an error message.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationRequest request) {
        logger.info("--- TRIGGERED /api/auth/register ENDPOINT ---");

        // Validate the reCAPTCHA token first
        if (!recaptchaService.validateRecaptcha(request.getRecaptchaToken())) {
            logger.warn("reCAPTCHA validation failed for email: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("reCAPTCHA validation failed.");
        }

        try {
            logger.info("Attempting to register user with email: {}", request.getEmail());

            // Create the user object from the request DTO
            User user = new User();
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());

            User registeredUser = userService.registerUser(user);
            logger.info("Successfully processed registration for user: {}", registeredUser.getEmail());
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            logger.error("!!! CRITICAL ERROR IN /api/auth/register !!!", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error in AuthController: " + e.getMessage());
        }
    }

    /**
     * Handles password change requests for authenticated users.
     *
     * @param request The request containing the old and new passwords.
     * @return A ResponseEntity indicating the result.
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        userService.changePassword(email, request);
        return ResponseEntity.ok().body("Password changed");
    }

    /**
     * Confirms a user's email address using a confirmation code.
     *
     * @param request The request containing the email and confirmation code.
     * @return A ResponseEntity indicating the result.
     */
    @PostMapping("/confirm-email")
    public ResponseEntity<?> confirmEmail(@RequestBody EmailConfirmationRequest request){
        try{
            userService.confirmEmail(request.getEmail(), request.getConfirmationCode());
            return ResponseEntity.ok().body("Email confirmed successfuly");
        }catch (BadCredentialsException e){
            return ResponseEntity.badRequest().body("Invalid confirmation code");
        }
        catch (ResourceNotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Initiates the password reset process for a user.
     *
     * @param request The request containing the user's email.
     * @return A ResponseEntity indicating the result.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Password reset link sent to your email.");
    }

    /**
     * Resets a user's password using a reset token.
     *
     * @param request The request containing the token and new password.
     * @return A ResponseEntity indicating the result.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successfully.");
    }

    /**
     * Retrieves the role of the currently authenticated user.
     *
     * @return A ResponseEntity containing the user's role.
     */
    @GetMapping("/user/role")
    public ResponseEntity<String> getUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        if (user != null) {
            String role = String.valueOf(user.getRole());
            return ResponseEntity.ok(role);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Retrieves a user's email by their ID.
     *
     * @param id The ID of the user.
     * @return A ResponseEntity containing the user's email.
     */
    @GetMapping("/user/{id}")
    public ResponseEntity<String> getUserEmailById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user.getEmail());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Retrieves the profile of the currently authenticated user.
     *
     * @return A ResponseEntity containing the user's profile DTO.
     */
    @GetMapping("/user/profile")
    public ResponseEntity<UserDTO> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(userMapper.toDTO(user));
    }
}