import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        category: 'All',
        minPrice: '',
        maxPrice: '',
        sort: 'name_asc',
        type: 'all'
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const params = {
                    search: filters.search,
                    category: filters.category === 'All' ? null : filters.category,
                    minPrice: filters.minPrice || null,
                    maxPrice: filters.maxPrice || null,
                    sort: filters.sort,
                    type: filters.type === 'all' ? null : filters.type
                };
                const response = await axios.get('http://localhost:8080/api/products/filter', { params });
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products', error);
            }
        };

        fetchProducts();
    }, [filters]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories', error);
            }
        };

        fetchCategories();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    return (
        <div className="products-page">
            <h1>Our Products</h1>
            <div className="filters">
                <input
                    type="text"
                    name="search"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={handleFilterChange}
                />
                <select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="All">All Categories</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                />
                <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
                <div className="type-filter">
                    <label>
                        <input
                            type="radio"
                            name="type"
                            value="all"
                            checked={filters.type === 'all'}
                            onChange={handleFilterChange}
                        />
                        All
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="type"
                            value="men"
                            checked={filters.type === 'men'}
                            onChange={handleFilterChange}
                        />
                        Men
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="type"
                            value="women"
                            checked={filters.type === 'women'}
                            onChange={handleFilterChange}
                        />
                        Women
                    </label>
                </div>
            </div>
            <div className="product-list">
                {products.length > 0 ? (
                    products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p>No products match your criteria.</p>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;