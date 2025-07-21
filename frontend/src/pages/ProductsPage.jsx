// frontend/src/pages/ProductsPage.jsx

import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getAllProducts, getAllCategories, getAllPacks } from '../api/apiService';
import Loader from '../components/Loader';
import PackCard from '../components/PackCard'; // Import PackCard
import ReactGA from 'react-ga4'; // <-- 1. Import ReactGA

const ProductsPage = () => {
    const [items, setItems] = useState([]); // Changed from 'products' to 'items'
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
        productType: 'products' // 'products' or 'packs'
    });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sort, setSort] = useState('name,asc');

    const fetchItemsAndCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const categoriesResponse = await getAllCategories();
            setCategories(categoriesResponse.data);

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

            let response;
            if (filters.productType === 'packs') {
                response = await getAllPacks(params);
                // Handle the array directly for packs
                setItems(response.data);
                setTotalPages(1); // Since it's not paginated, there's only one page
            } else {
                response = await getAllProducts(params);
                // Handle the paginated object for products
                setItems(response.data.content);
                setTotalPages(response.data.totalPages);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItemsAndCategories();
    }, [filters, page, sort]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        // v-- 2. Add this block --v
        if (name === 'search' && value) {
            ReactGA.event({
                category: 'Engagement',
                action: 'search',
                label: value // This sends the exact search term to GA
            });
        }
        // ^-- End of new block --^

        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(0);
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
        setPage(0);
    };

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

    // Determine which card component to use
    const CardComponent = filters.productType === 'packs' ? PackCard : ProductCard;


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 p-4 bg-gray-100 rounded-lg">
                <input
                    type="text"
                    name="search"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="p-2 border rounded-md"
                />
                <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="p-2 border rounded-md" disabled={filters.productType === 'packs'}>
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
                <select name="type" value={filters.type} onChange={handleFilterChange} className="p-2 border rounded-md" disabled={filters.productType === 'packs'}>
                    <option value="ALL">All Genders</option>
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="BOTH">Both</option>
                </select>
                <select name="productType" value={filters.productType} onChange={handleFilterChange} className="p-2 border rounded-md">
                    <option value="products">Products</option>
                    <option value="packs">Packs</option>
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
                        {items.length > 0 ? (
                            items.map(item => (
                                <CardComponent key={item.id} product={item} pack={item} />
                            ))
                        ) : (
                            <p className="col-span-full text-center">No items match your criteria.</p>
                        )}
                    </div>
                    {/* Pagination Controls - only show if productType is not packs */}
                    {filters.productType !== 'packs' && totalPages > 1 && (
                        <div className="flex justify-center items-center mt-8 space-x-4">
                            <button onClick={handlePrevPage} disabled={page === 0} className="px-4 py-2 bg-pink-500 text-white rounded-md disabled:bg-gray-300">
                                Previous
                            </button>
                            <span>Page {page + 1} of {totalPages}</span>
                            <button onClick={handleNextPage} disabled={page >= totalPages - 1} className="px-4 py-2 bg-pink-500 text-white rounded-md disabled:bg-gray-300">
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductsPage;