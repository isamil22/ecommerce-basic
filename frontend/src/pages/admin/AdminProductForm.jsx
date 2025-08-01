import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// --- CORRECTED IMPORTS ---
import { getAllCategories, getProductById, createProduct, updateProduct } from '../../api/apiService';
import AWSService from '../../api/awsService'; // Corrected path

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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Now using the imported function correctly
                const response = await getAllCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchProduct = async () => {
            if (id) {
                try {
                    // Now using the imported function correctly
                    const response = await getProductById(id);
                    const productData = response.data;
                    setProduct({
                        ...productData,
                        variantTypes: productData.variantTypes.map(vt => ({...vt, options: vt.options.join(', ')})),
                        variants: productData.variants || []
                    });
                    setImagePreviews(productData.images || []);
                } catch (error) {
                    console.error('Error fetching product:', error);
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

    // --- All variant handling functions remain the same ---
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
    // --- End of variant handling functions ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const uploadedImageUrls = await Promise.all(
                images.map(image => AWSService.uploadFile(image))
            );

            const productData = { ...product, images: [...imagePreviews, ...uploadedImageUrls] };

            if (product.hasVariants) {
                productData.variantTypes = product.variantTypes.map(vt => ({
                    ...vt,
                    options: vt.options.split(',').map(o => o.trim())
                }));
            } else {
                productData.variantTypes = [];
                productData.variants = [];
            }

            const formData = new FormData();
            const blob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
            formData.append('product', blob);

            images.forEach(image => {
                formData.append('images', image);
            });

            if (id) {
                await updateProduct(id, formData);
            } else {
                await createProduct(formData);
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h2>{id ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
                {/* Standard product fields */}
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" name="name" value={product.name} onChange={handleInputChange} required />
                </div>

                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea className="form-control" id="description" name="description" value={product.description} onChange={handleInputChange} required />
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="price" className="form-label">Price</label>
                        <input type="number" className="form-control" id="price" name="price" value={product.price} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="quantity" className="form-label">Stock Quantity</label>
                        <input type="number" className="form-control" id="quantity" name="quantity" value={product.quantity} onChange={handleInputChange} required />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="brand" className="form-label">Brand</label>
                        <input type="text" className="form-control" id="brand" name="brand" value={product.brand} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="categoryId" className="form-label">Category</label>
                        <select className="form-control" id="categoryId" name="categoryId" value={product.categoryId} onChange={handleInputChange} required>
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Type</label>
                    <select className="form-control" id="type" name="type" value={product.type} onChange={handleInputChange}>
                        <option value="MEN">Men</option>
                        <option value="WOMEN">Women</option>
                        <option value="BOTH">Both</option>
                    </select>
                </div>

                <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="bestseller" name="bestseller" checked={product.bestseller} onChange={handleInputChange} />
                    <label className="form-check-label" htmlFor="bestseller">Bestseller</label>
                </div>

                <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="newArrival" name="newArrival" checked={product.newArrival} onChange={handleInputChange} />
                    <label className="form-check-label" htmlFor="newArrival">New Arrival</label>
                </div>

                <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="hasVariants" name="hasVariants" checked={product.hasVariants} onChange={handleInputChange} />
                    <label className="form-check-label" htmlFor="hasVariants">Has Variants</label>
                </div>

                {/* Variant Types Section */}
                {product.hasVariants && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h4>Variant Types</h4>
                        </div>
                        <div className="card-body">
                            {product.variantTypes.map((vt, index) => (
                                <div key={index} className="row g-3 align-items-center mb-3 p-2 border rounded">
                                    <div className="col-md-5">
                                        <label className="form-label">Type Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., Size"
                                            value={vt.name}
                                            onChange={(e) => handleVariantTypeChange(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label">Options (comma-separated)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., S, M, L"
                                            value={vt.options}
                                            onChange={(e) => handleVariantTypeChange(index, 'options', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button type="button" className="btn btn-danger" onClick={() => removeVariantType(index)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="btn btn-primary" onClick={addVariantType}>Add Variant Type</button>
                        </div>
                    </div>
                )}

                {/* Variants Section */}
                {product.hasVariants && product.variantTypes.length > 0 && (
                    <div className="card">
                        <div className="card-header">
                            <h4>Product Variants</h4>
                        </div>
                        <div className="card-body">
                            {product.variants.map((variant, index) => (
                                <div key={index} className="row g-3 align-items-center mb-3 p-2 border rounded">
                                    {product.variantTypes.map(vt => (
                                        <div className="col-md-3" key={vt.name}>
                                            <label className="form-label">{vt.name}</label>
                                            <select
                                                className="form-select"
                                                value={variant.variantMap[vt.name]}
                                                onChange={(e) => handleVariantMapChange(index, vt.name, e.target.value)}
                                            >
                                                {(vt.options.split(',') || []).map(opt => (
                                                    <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                    <div className="col-md-2">
                                        <label className="form-label">Price</label>
                                        <input type="number" className="form-control" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Stock</label>
                                        <input type="number" className="form-control" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button type="button" className="btn btn-danger" onClick={() => removeVariant(index)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="btn btn-success" onClick={addVariant}>Add Variant</button>
                        </div>
                    </div>
                )}

                <div className="mb-3">
                    <label htmlFor="images" className="form-label">Images</label>
                    <input type="file" className="form-control" id="images" name="images" onChange={handleImageChange} multiple />
                </div>

                <div className="d-flex flex-wrap">
                    {imagePreviews.map((preview, index) => (
                        <img key={index} src={preview} alt="Product preview" className="img-thumbnail" style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }} />
                    ))}
                </div>

                <button type="submit" className="btn btn-primary mt-4">{id ? 'Update Product' : 'Add Product'}</button>
            </form>
        </div>
    );
};

export default AdminProductForm;