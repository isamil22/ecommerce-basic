import React from 'react';
import { Oval } from 'react-loader-spinner';

const Loader = () => {
    return (
        <div className="flex justify-center items-center h-full py-20">
            <Oval
                height={80}
                width={80}
                color="#E91E63"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
                ariaLabel='oval-loading'
                secondaryColor="#F8BBD0"
                strokeWidth={2}
                strokeWidthSecondary={2}
            />
        </div>
    );
};

export default Loader;