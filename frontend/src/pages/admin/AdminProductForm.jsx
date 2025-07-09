import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductById, uploadDescriptionImage, getAllCategories } from '../../api/apiService';
import Loader from '../../components/Loader';

const AdminProductForm = () => {
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        quantity: '',
        brand: '',
        bestseller: false,
        newArrival: false,
    });
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await getAllCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
                setError("Failed to load product categories. Please try again.");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const { data } = await getProductById(id);
                    setProduct({
                        name: data.name || '',
                        description: data.description || '',
                        price: data.price || '',
                        categoryId: data.categoryId || '',
                        quantity: data.quantity || '',
                        brand: data.brand || '',
                        bestseller: data.bestseller || false,
                        newArrival: data.newArrival || false,
                    });
                } catch (err) {
                    setError(err.response?.data?.message || err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleDescriptionChange = (content) => {
        setProduct((prev) => ({ ...prev, description: content }));
    };

    const handleImageChange = (e) => {
        setImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));

        if (images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                formData.append('images', images[i]);
            }
        }

        try {
            if (id) {
                await updateProduct(id, formData);
            } else {
                await createProduct(formData);
            }
            navigate('/admin/products');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during submission.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (blobInfo) => new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('image', blobInfo.blob(), blobInfo.filename());
        uploadDescriptionImage(formData)
            .then((response) => {
                if (response.data && response.data.url) {
                    resolve(response.data.url);
                } else {
                    reject('Invalid JSON response');
                }
            })
            .catch((error) => {
                reject(`Image upload failed: ${error.message}`);
            });
    });

    if (loading && id) {
        return <Loader />;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Product' : 'Create Product'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" id="name" name="name" value={product.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>

                    {/* Brand */}
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                        <input type="text" id="brand" name="brand" value={product.brand} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                        <input type="number" step="0.01" id="price" name="price" value={product.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>

                    {/* Stock Quantity */}
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input type="number" id="quantity" name="quantity" value={product.quantity} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2">
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="categoryId" name="categoryId" value={product.categoryId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
                            <option value="">-- Select a Category --</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description Editor */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Editor
                        apiKey="jeqjwyja4t9lzd3h889y31tf98ag6a1kp16xfns173v9cgr0"
                        value={product.description}
                        onEditorChange={handleDescriptionChange}
                        init={{
                            height: 350,
                            menubar: false,
                            plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'],
                            toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image | help',
                            images_upload_handler: handleImageUpload,
                            automatic_uploads: true,
                            file_picker_types: 'image',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                        }}
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label htmlFor="images" className="block text-sm font-medium text-gray-700">Product Images</label>
                    <input type="file" id="images" name="images" multiple onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center space-x-8">
                    <div className="flex items-center">
                        <input type="checkbox" id="bestseller" name="bestseller" checked={product.bestseller} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                        <label htmlFor="bestseller" className="ml-2 block text-sm text-gray-900">Mark as Bestseller</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="newArrival" name="newArrival" checked={product.newArrival} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                        <label htmlFor="newArrival" className="ml-2 block text-sm text-gray-900">Mark as New Arrival</label>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button type="submit" className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500" disabled={loading}>
                        {loading ? 'Saving...' : (id ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductForm;