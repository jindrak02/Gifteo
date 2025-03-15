import React from "react";

type WishlistDetailProps = {
    wishlistId: string;
};

const WishlistDetail = (props: WishlistDetailProps) => {
    return (
        <div>
            <h1>Wishlist Detail: {props.wishlistId}</h1>
        </div>
    );
}

export default WishlistDetail;