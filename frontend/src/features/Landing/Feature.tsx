import React from "react";
import styles from ".././../assets/landing.module.css";

interface FeatureProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const Feature: React.FC<FeatureProps> = ({ title, description, icon }) => {
    return (
        <div className={styles.fetaureCardFlex}>
            <div style={{ fontSize: "2rem", color: "#6F2BF6", marginBottom: "15px" }}>
                {icon}
            </div>
            <h5 style={{ fontWeight: "bold", color: "#333", marginBottom: "10px" }}>{title}</h5>
            <hr style={{ margin: "10px 0" }} />
            <p style={{ color: "#555" }}>{description}</p>
        </div>
    );
};

export default Feature;
