import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { getAllProducts, getAllCategories } from '../api/apiService';
import Loader from '../components/Loader';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        categoryId: '',
        minPrice: '',
        maxPrice: '',
        brand: '',
        type: 'ALL',
    });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sort, setSort] = useState('name,asc');

    const fetchProductsAndCategories = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch categories first or in parallel
            const categoriesResponse = await getAllCategories();
            setCategories(categoriesResponse.data);

            // Prepare params for fetching products
            const [sortField, sortDirection] = sort.split(',');
            const params = {
                page,
                sort: `${sortField},${sortDirection}`,
                search: filters.search || null,
                categoryId: filters.categoryId || null,
                minPrice: filters.minPrice || null,
                maxPrice: filters.maxPrice || null,
                brand: filters.brand || null,
                type: filters.type === 'ALL' ? null : filters.type,
            };

            // Fetch products
            const productsResponse = await getAllProducts(params);
            setProducts(productsResponse.data.content);
            setTotalPages(productsResponse.data.totalPages);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductsAndCategories();
    }, [filters, page, sort]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(0); // Reset to the first page on filter change
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
        setPage(0); // Reset to the first page on sort change
    };

    // Pagination handlers
    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 p-4 bg-gray-100 rounded-lg">
                <input
                    type="text"
                    name="search"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="p-2 border rounded-md"
                />
                <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="p-2 border rounded-md">
                    <option value="">All Categories</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="p-2 border rounded-md"
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="p-2 border rounded-md"
                />
                <select name="type" value={filters.type} onChange={handleFilterChange} className="p-2 border rounded-md">
                    <option value="ALL">All Genders</option>
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="BOTH">Both</option>
                </select>
                <select value={sort} onChange={handleSortChange} className="p-2 border rounded-md md:col-span-2 lg:col-span-1">
                    <option value="name,asc">Name: A-Z</option>
                    <option value="name,desc">Name: Z-A</option>
                    <option value="price,asc">Price: Low to High</option>
                    <option value="price,desc">Price: High to Low</option>
                </select>
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p className="col-span-full text-center">No products match your criteria.</p>
                        )}
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center mt-8 space-x-4">
                        <button onClick={handlePrevPage} disabled={page === 0} className="px-4 py-2 bg-pink-500 text-white rounded-md disabled:bg-gray-300">
                            Previous
                        </button>
                        <span>Page {page + 1} of {totalPages}</span>
                        <button onClick={handleNextPage} disabled={page >= totalPages - 1} className="px-4 py-2 bg-pink-500 text-white rounded-md disabled:bg-gray-300">
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductsPage;