import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
    const activeLinkClass = "bg-pink-600 text-white";
    const inactiveLinkClass = "text-gray-200 hover:bg-pink-500 hover:text-white";

    return (
        <div className="bg-gray-800 text-white w-64 space-y-2 py-7 px-2">
            <h2 className="text-2xl font-extrabold text-center mb-6">Admin Panel</h2>
            <nav>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `block py-2.5 px-4 rounded transition duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    Dashboard
                </NavLink>
                <NavLink to="/admin/hero" className={({ isActive }) => `block py-2.5 px-4 rounded transition duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    Hero Section
                </NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => `block py-2.5 px-4 rounded transition duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    Products
                </NavLink>
                <NavLink to="/admin/categories" className={({ isActive }) => `block py-2.5 px-4 rounded transition duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    Categories
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => `block py-2.5 px-4 rounded transition duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    Orders
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => `block py-2.5 px-4 rounded transition duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    Users
                </NavLink>
                <NavLink to="/admin/reviews" className={({ isActive }) => `block py-2.5 px-4 rounded transition duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    Reviews
                </NavLink>
            </nav>
        </div>
    );
};

export default AdminSidebar;