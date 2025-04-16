import React, { useState } from "react";

interface UserAvatarProps {
  imgSrc: string | undefined | null;
  altText: string;
  className?: string;
  key?: string | number;
}

const UserAvatar = (props: UserAvatarProps) => {

  return (
    <img
      src={
        props.imgSrc ||
        "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg"
      }

      onError={(e) => {
        e.currentTarget.src =
          "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg";
      }}

      alt={props.altText}
      className={props.className}
    />
  );
};

export default UserAvatar;
