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
                    // Prepare product data for the form state
                    setProduct({
                        ...productData,
                        variantTypes: productData.variantTypes ? productData.variantTypes.map(vt => ({...vt, options: vt.options.join(', ')})) : [],
                        variants: productData.variants || []
                    });
                    setImagePreviews(productData.images || []);
                } catch (error) {
                    console.error('Error fetching product:', error);
                    setError('Failed to load product data.');
                }
            }
        };

        fetchCategories();
        fetchProduct();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleVariantTypeChange = (index, field, value) => {
        const updatedVariantTypes = [...product.variantTypes];
        updatedVariantTypes[index][field] = value;
        setProduct({ ...product, variantTypes: updatedVariantTypes });
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
        const newVariant = { variantMap: {}, price: '', stock: '' };
        product.variantTypes.forEach(vt => {
            newVariant.variantMap[vt.name] = vt.options.split(',')[0]?.trim() || '';
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editorRef.current) {
            product.description = editorRef.current.getContent();
        }

        const formData = new FormData();

        const productDataToSend = {
            ...product,
            variantTypes: product.hasVariants ? product.variantTypes.map(vt => ({
                ...vt,
                options: vt.options.split(',').map(o => o.trim())
            })) : [],
            variants: product.hasVariants ? product.variants : []
        };

        formData.append('product', new Blob([JSON.stringify(productDataToSend)], { type: 'application/json' }));

        images.forEach(imageFile => {
            formData.append('images', imageFile);
        });

        try {
            if (id) {
                await updateProduct(id, formData);
                setSuccess('Product updated successfully!');
            } else {
                await createProduct(formData);
                setSuccess('Product created successfully!');
            }
            setTimeout(() => navigate('/admin/products'), 2000);
        } catch (error) {
            setError('Failed to save product. Please check all fields.');
            console.error('Error saving product:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Product' : 'Add Product'}</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" id="name" value={product.name} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                        <input type="number" name="price" id="price" value={product.price} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input type="number" name="quantity" id="quantity" value={product.quantity} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                        <input type="text" name="brand" id="brand" value={product.brand} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
                        <select name="categoryId" id="categoryId" value={product.categoryId} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                        <select name="type" id="type" value={product.type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
                            <option value="MEN">Men</option>
                            <option value="WOMEN">Women</option>
                            <option value="BOTH">Both</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <Editor
                        apiKey='jeqjwyja4t9lzd3h889y31tf98ag6a1kp16xfns173v9cgr0' // IMPORTANT: Replace with your actual TinyMCE API key
                        onInit={(evt, editor) => editorRef.current = editor}
                        initialValue={product.description}
                        init={{
                            height: 500,
                            menubar: false,
                            plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
                            toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                            images_upload_handler: async (blobInfo) => {
                                const formData = new FormData();
                                formData.append('image', blobInfo.blob(), blobInfo.filename());
                                const response = await uploadDescriptionImage(formData);
                                return response.data.url;
                            }
                        }}
                    />
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <input type="checkbox" name="bestseller" id="bestseller" checked={product.bestseller} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                        <label htmlFor="bestseller" className="ml-2 block text-sm text-gray-900">Bestseller</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" name="newArrival" id="newArrival" checked={product.newArrival} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                        <label htmlFor="newArrival" className="ml-2 block text-sm text-gray-900">New Arrival</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" name="hasVariants" id="hasVariants" checked={product.hasVariants} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                        <label htmlFor="hasVariants" className="ml-2 block text-sm text-gray-900">Has Variants</label>
                    </div>
                </div>

                {product.hasVariants && (
                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="text-lg font-semibold">Variant Types</h3>
                        {product.variantTypes.map((vt, index) => (
                            <div key={index} className="flex items-end gap-4">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium">Type Name</label>
                                    <input type="text" placeholder="e.g., Size" value={vt.name} onChange={(e) => handleVariantTypeChange(index, 'name', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium">Options (comma-separated)</label>
                                    <input type="text" placeholder="e.g., S, M, L" value={vt.options} onChange={(e) => handleVariantTypeChange(index, 'options', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <button type="button" onClick={() => removeVariantType(index)} className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600">-</button>
                            </div>
                        ))}
                        <button type="button" onClick={addVariantType} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Add Variant Type</button>
                    </div>
                )}

                {product.hasVariants && product.variantTypes.length > 0 && (
                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="text-lg font-semibold">Product Variants</h3>
                        {product.variants.map((variant, index) => (
                            <div key={index} className="flex items-end gap-4">
                                {product.variantTypes.map(vt => (
                                    <div key={vt.name} className="flex-grow">
                                        <label className="block text-sm font-medium">{vt.name}</label>
                                        <select value={variant.variantMap[vt.name] || ''} onChange={(e) => handleVariantMapChange(index, vt.name, e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm">
                                            {(vt.options.split(',') || []).map(opt => <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>)}
                                        </select>
                                    </div>
                                ))}
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium">Price</label>
                                    <input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium">Stock</label>
                                    <input type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <button type="button" onClick={() => removeVariant(index)} className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600">-</button>
                            </div>
                        ))}
                        <button type="button" onClick={addVariant} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Add Variant</button>
                    </div>
                )}

                <div>
                    <label htmlFor="images" className="block text-sm font-medium text-gray-700">Product Images</label>
                    <input type="file" name="images" id="images" onChange={handleImageChange} multiple className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                </div>

                <div className="flex flex-wrap gap-4">
                    {imagePreviews.map((preview, index) => (
                        <img key={index} src={preview} alt="Product preview" className="w-24 h-24 object-cover rounded-md" />
                    ))}
                </div>

                <button type="submit" className="w-full bg-pink-600 text-white py-3 px-4 rounded-md hover:bg-pink-700 font-bold">{id ? 'Update Product' : 'Add Product'}</button>
            </form>
        </div>
    );
};

export default AdminProductForm;