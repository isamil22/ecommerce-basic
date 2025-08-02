import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, createProduct, updateProduct, getAllCategories, uploadDescriptionImage } from '../../api/apiService';
import { Editor } from '@tinymce/tinymce-react';

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        brand: '',
        categoryId: '',
        type: 'BOTH',
        bestseller: false,
        newArrival: false,
        hasVariants: false,
        variantTypes: [],
        variants: []
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [variantImages, setVariantImages] = useState({});
    const [variantImagePreviews, setVariantImagePreviews] = useState({});
    const editorRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAllCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories.');
            }
        };

        const fetchProduct = async () => {
            if (id) {
                try {
                    const response = await getProductById(id);
                    const productData = response.data;
                    setProduct({
                        ...productData,
                        hasVariants: productData.hasVariants || false,
                        variantTypes: productData.variantTypes ? productData.variantTypes.map(vt => ({
                            ...vt,
                            options: Array.isArray(vt.options) ? vt.options.join(', ') : vt.options
                        })) : [],
                        variants: productData.variants || []
                    });
                    setImagePreviews(productData.images || []);
                    if (productData.variants) {
                        const previews = {};
                        productData.variants.forEach((variant, index) => {
                            if (variant.imageUrl) {
                                previews[index] = variant.imageUrl;
                            }
                        });
                        setVariantImagePreviews(previews);
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                    setError('Failed to load product data.');
                }
            }
        };

        fetchCategories();
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product.hasVariants && product.variantTypes.length > 0 && product.variantTypes.every(vt => vt.name && vt.options)) {
            const generateCombinations = (types) => {
                if (types.length === 0) {
                    return [{}];
                }
                const firstType = types[0];
                const restOfTypes = types.slice(1);
                const options = firstType.options.split(',').map(o => o.trim()).filter(Boolean);
                const combinations = generateCombinations(restOfTypes);
                const newCombinations = [];
                options.forEach(option => {
                    combinations.forEach(combination => {
                        newCombinations.push({ ...combination, [firstType.name]: option });
                    });
                });
                return newCombinations;
            };

            const combinations = generateCombinations(product.variantTypes);
            const newVariants = combinations.map(variantMap => {
                const existingVariant = product.variants.find(v =>
                    JSON.stringify(v.variantMap) === JSON.stringify(variantMap)
                );
                return {
                    variantMap,
                    price: existingVariant?.price || product.price,
                    stock: existingVariant?.stock || 0,
                    imageUrl: existingVariant?.imageUrl || ''
                };
            });
            setProduct(prev => ({ ...prev, variants: newVariants }));
        } else if (product.hasVariants && product.variantTypes.length > 0) {
            setProduct(prev => ({ ...prev, variants: [] }));
        }
    }, [product.variantTypes]);


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => {
            const newProduct = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            if (name === 'hasVariants' && !checked) {
                newProduct.variantTypes = [];
                newProduct.variants = [];
                setVariantImages({});
                setVariantImagePreviews({});
            }

            return newProduct;
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleVariantImageChange = (variantIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            setVariantImages(prev => ({
                ...prev,
                [variantIndex]: file
            }));

            const preview = URL.createObjectURL(file);
            setVariantImagePreviews(prev => ({
                ...prev,
                [variantIndex]: preview
            }));
        }
    };

    const removeVariantImage = (variantIndex) => {
        setVariantImages(prev => {
            const updated = { ...prev };
            delete updated[variantIndex];
            return updated;
        });

        setVariantImagePreviews(prev => {
            const updated = { ...prev };
            delete updated[variantIndex];
            return updated;
        });

        const updatedVariants = [...product.variants];
        updatedVariants[variantIndex].imageUrl = '';
        setProduct({ ...product, variants: updatedVariants });
    };

    const handleVariantTypeChange = (index, field, value) => {
        const updatedTypes = product.variantTypes.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setProduct(prev => ({ ...prev, variantTypes: updatedTypes }));
    };

    const addVariantType = () => {
        setProduct({
            ...product,
            variantTypes: [...product.variantTypes, { name: '', options: '' }]
        });
    };

    const removeVariantType = (index) => {
        const updatedVariantTypes = product.variantTypes.filter((_, i) => i !== index);
        setProduct({ ...product, variantTypes: updatedVariantTypes });
    };

    const addVariant = () => {
        const newVariant = { variantMap: {}, price: '', stock: '', imageUrl: '' };
        product.variantTypes.forEach(vt => {
            if (vt.options && vt.options.trim()) {
                const firstOption = vt.options.split(',')[0]?.trim() || '';
                newVariant.variantMap[vt.name] = firstOption;
            }
        });
        setProduct({ ...product, variants: [...product.variants, newVariant] });
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...product.variants];
        updatedVariants[index][field] = value;
        setProduct({ ...product, variants: updatedVariants });
    };

    const handleVariantMapChange = (index, name, value) => {
        const updatedVariants = [...product.variants];
        updatedVariants[index].variantMap[name] = value;
        setProduct({ ...product, variants: updatedVariants });
    };

    const removeVariant = (index) => {
        const updatedVariants = product.variants.filter((_, i) => i !== index);
        setProduct({ ...product, variants: updatedVariants });

        setVariantImages(prev => {
            const updated = { ...prev };
            delete updated[index];
            return updated;
        });

        setVariantImagePreviews(prev => {
            const updated = { ...prev };
            delete updated[index];
            return updated;
        });
    };

    const validateForm = () => {
        if (!product.name.trim()) {
            setError('Product name is required');
            return false;
        }
        if (!product.price || parseFloat(product.price) <= 0) {
            setError('Valid price is required');
            return false;
        }
        if (!product.quantity || parseInt(product.quantity) < 0) {
            setError('Valid quantity is required');
            return false;
        }
        if (!product.categoryId) {
            setError('Category is required');
            return false;
        }

        if (product.hasVariants) {
            if (product.variantTypes.length === 0) {
                setError('At least one variant type is required when variants are enabled');
                return false;
            }

            for (let vt of product.variantTypes) {
                if (!vt.name.trim()) {
                    setError('All variant types must have a name');
                    return false;
                }
                if (!vt.options.trim()) {
                    setError('All variant types must have options');
                    return false;
                }
            }

            if (product.variants.length === 0) {
                setError('At least one variant is required when variants are enabled');
                return false;
            }

            for (let variant of product.variants) {
                if (!variant.price || parseFloat(variant.price) <= 0) {
                    setError('All variants must have a valid price');
                    return false;
                }
                if (variant.stock < 0) {
                    setError('Variant stock cannot be negative');
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        try {
            let description = product.description;
            if (editorRef.current) {
                description = editorRef.current.getContent();
            }

            const formData = new FormData();

            const variantImageUrls = {};
            for (const [index, file] of Object.entries(variantImages)) {
                if (file) {
                    try {
                        const variantImageFormData = new FormData();
                        variantImageFormData.append('image', file);
                        const response = await uploadDescriptionImage(variantImageFormData);
                        variantImageUrls[index] = response.data.url;
                    } catch (error) {
                        console.error(`Error uploading variant image for index ${index}:`, error);
                    }
                }
            }

            const productDataToSend = {
                ...product,
                description,
                hasVariants: product.hasVariants,
                variantTypes: product.hasVariants ? product.variantTypes.map(vt => ({
                    name: vt.name.trim(),
                    options: vt.options.split(',').map(o => o.trim()).filter(o => o.length > 0)
                })) : [],
                variants: product.hasVariants ? product.variants.map((variant, index) => ({
                    variantMap: variant.variantMap,
                    price: parseFloat(variant.price),
                    stock: parseInt(variant.stock) || 0,
                    imageUrl: variantImageUrls[index] || variant.imageUrl || ''
                })) : []
            };

            console.log('Sending product data:', productDataToSend);
            formData.append('product', JSON.stringify(productDataToSend));

            if (images && images.length > 0) {
                images.forEach(imageFile => {
                    formData.append('images', imageFile);
                });
            }

            let response;
            if (id) {
                response = await updateProduct(id, formData);
                setSuccess('Product updated successfully!');
            } else {
                response = await createProduct(formData);
                setSuccess('Product created successfully!');
            }

            console.log('Response:', response.data);

            setTimeout(() => {
                navigate('/admin/products');
            }, 2000);

        } catch (error) {
            console.error('Error saving product:', error);
            let errorMessage = 'Failed to save product. Please check all fields.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data) {
                errorMessage = typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data);
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Product' : 'Add Product'}</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{success}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                {/* JSX for the form fields is omitted for brevity but is identical to the previous version */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={product.name}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price *</label>
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            id="price"
                            value={product.price}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Stock Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            value={product.quantity}
                            onChange={handleInputChange}
                            required
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                        <input
                            type="text"
                            name="brand"
                            id="brand"
                            value={product.brand}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category *</label>
                        <select
                            name="categoryId"
                            id="categoryId"
                            value={product.categoryId}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            name="type"
                            id="type"
                            value={product.type}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        >
                            <option value="MEN">Men</option>
                            <option value="WOMEN">Women</option>
                            <option value="BOTH">Both</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <Editor
                        apiKey='jeqjwyja4t9lzd3h889y31tf98ag6a1kp16xfns173v9cgr0'
                        onInit={(evt, editor) => editorRef.current = editor}
                        initialValue={product.description}
                        init={{
                            height: 500,
                            menubar: false,
                            plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
                            toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                            images_upload_handler: async (blobInfo) => {
                                try {
                                    const formData = new FormData();
                                    formData.append('image', blobInfo.blob(), blobInfo.filename());
                                    const response = await uploadDescriptionImage(formData);
                                    return response.data.url;
                                } catch (error) {
                                    console.error('Error uploading image:', error);
                                    throw error;
                                }
                            }
                        }}
                    />
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="bestseller"
                            id="bestseller"
                            checked={product.bestseller}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <label htmlFor="bestseller" className="ml-2 block text-sm text-gray-900">Bestseller</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="newArrival"
                            id="newArrival"
                            checked={product.newArrival}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <label htmlFor="newArrival" className="ml-2 block text-sm text-gray-900">New Arrival</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="hasVariants"
                            id="hasVariants"
                            checked={product.hasVariants}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <label htmlFor="hasVariants" className="ml-2 block text-sm text-gray-900">Has Variants</label>
                    </div>
                </div>

                {product.hasVariants && (
                    <div className="p-4 border rounded-md space-y-4 bg-gray-50">
                        <h3 className="text-lg font-semibold">Variant Types</h3>
                        {product.variantTypes.map((vt, index) => (
                            <div key={index} className="flex items-end gap-4 p-3 bg-white rounded border">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium">Type Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Size, Color"
                                        value={vt.name}
                                        onChange={(e) => handleVariantTypeChange(index, 'name', e.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                        required
                                    />
                                </div>
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium">Options (comma-separated) *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., S, M, L, XL"
                                        value={vt.options}
                                        onChange={(e) => handleVariantTypeChange(index, 'options', e.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeVariantType(index)}
                                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addVariantType}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Add Variant Type
                        </button>
                    </div>
                )}

                {product.hasVariants && product.variants.length > 0 && (
                    <div className="p-4 border rounded-md space-y-4 bg-gray-50">
                        <h3 className="text-lg font-semibold">Product Variants</h3>
                        {product.variants.map((variant, index) => (
                            <div key={index} className="p-4 bg-white rounded border space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {product.variantTypes.map(vt => (
                                        <div key={vt.name}>
                                            <label className="block text-sm font-medium">{vt.name}</label>
                                            <select
                                                value={variant.variantMap[vt.name] || ''}
                                                onChange={(e) => handleVariantMapChange(index, vt.name, e.target.value)}
                                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                required
                                            >
                                                <option value="">Select {vt.name}</option>
                                                {(vt.options.split(',') || []).map(opt => (
                                                    <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-sm font-medium">Price *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Stock *</label>
                                        <input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Variant Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleVariantImageChange(index, e)}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                                        />
                                    </div>
                                </div>

                                {variantImagePreviews[index] && (
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={variantImagePreviews[index]}
                                            alt={`Variant ${index + 1} preview`}
                                            className="w-20 h-20 object-cover rounded-md border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeVariantImage(index)}
                                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                                    >
                                        Remove Variant
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addVariant}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                        >
                            Add Variant
                        </button>
                    </div>
                )}

                <div>
                    <label htmlFor="images" className="block text-sm font-medium text-gray-700">Product Images</label>
                    <input
                        type="file"
                        name="images"
                        id="images"
                        onChange={handleImageChange}
                        multiple
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                    />
                </div>

                {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {imagePreviews.map((preview, index) => (
                            <img
                                key={index}
                                src={preview}
                                alt={`Product preview ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-md border"
                            />
                        ))}
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-pink-600 text-white py-3 px-4 rounded-md hover:bg-pink-700 font-bold transition-colors"
                    >
                        {id ? 'Update Product' : 'Add Product'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 font-bold transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductForm;