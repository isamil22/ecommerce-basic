import React from 'react';

const PackCard = ({ pack }) => {
    return (
        <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{pack.name}</h3>
                <p className="text-gray-600">{pack.description}</p>
                <p className="text-lg font-bold text-pink-500 mt-2">
                    {pack.price != null ? `$${pack.price.toFixed(2)}` : 'Price not available'}
                </p>
                <div className="mt-4">
                    <h4 className="font-semibold">Items in this pack:</h4>
                    <ul className="list-disc list-inside">
                        {pack.items.map(item => (
                            <li key={item.id}>{item.defaultProduct.name}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PackCard;