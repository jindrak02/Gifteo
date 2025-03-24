import React, { useState, useEffect } from 'react';
import WishlistThumbnail from '../../../components/wishlist/WishlistThumbnail';

interface AddWishlistCopyProps {
    person_id: string;
    profile_id: string;
}

const AddWishlistCopy: React.FC<AddWishlistCopyProps> = ({ person_id, profile_id }) => {
    const [personId, setPersonId] = useState<string>(person_id);
    const [profileId, setProfileId] = useState<string>(profile_id);

    return (
        <div className="wishlist-copy-container">
            <div className="wishlist-upper-section">
                <h2 className='mb-4 text-center'>Select wishlist to copy</h2>

                <div className="wishlist-card">
                    <h3>Kacenka's b-day wishlist</h3>
                    <div className="wishlist-items">
                        <img src="path/to/mario.png" alt="Mario" />
                        <img src="path/to/keyboard.png" alt="Keyboard" />
                        <img src="path/to/plant.png" alt="Plant" />
                    </div>
                </div>
                
                <WishlistThumbnail showButtons={false} imageUrls={["neco", "neco"]} title='test' key={1}></WishlistThumbnail>

            </div>

            <div className="wishlist-lower-section">
                <h2 className='my-4'>Or add a custom wishlist</h2>
                <button className="add-custom-wishlist-btn my-4">Add custom wishlist</button>
            </div>
        </div>
    );
};

export default AddWishlistCopy;
