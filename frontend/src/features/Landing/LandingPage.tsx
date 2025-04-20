import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "../../assets/landing.module.css";
import Feature from "./Feature";
import { FaCalendarAlt, FaLightbulb, FaClipboardList, FaUserFriends, FaUser } from "react-icons/fa";

const LandingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const features = [
        {
            title: t("landingPage.features.yourPersonalWishlists.title"),
            description: t("landingPage.features.yourPersonalWishlists.description"),
            icon: <FaUser />
        },
        {
            title: t("landingPage.features.giftIdeas.title"),
            description: t("landingPage.features.giftIdeas.description"),
            icon: <FaLightbulb />
        },
        {
            title: t("landingPage.features.wishlistSharing.title"),
            description: t("landingPage.features.wishlistSharing.description"),
            icon: <FaClipboardList />
        },
        {
            title: t("landingPage.features.flexibleSharing.title"),
            description: t("landingPage.features.flexibleSharing.description"),
            icon: <FaUserFriends />
        },
        {
            title: t("landingPage.features.smartReminders.title"),
            description: t("landingPage.features.smartReminders.description"),
            icon: <FaCalendarAlt />
        },
        {
            title: t("landingPage.features.giftTracking.title"),
            description: t("landingPage.features.giftTracking.description"),
            icon: <FaClipboardList />
        }
    ];

    useEffect(() => {
        const handleScroll = () => {
            const featureCards = document.querySelectorAll(`.${styles.featureCard}`);
            featureCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    card.classList.add(styles.slideIn);
                    card.classList.add(index % 2 === 0 ? styles.slideInLeft : styles.slideInRight);
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <nav className={styles.navPanel}>
                <div className="flex">
                    <a href="#home">
                        <img
                            src="images/icon.png"
                            alt="Gifteo Icon"
                            className={styles.navIcon}
                        />
                    </a>
                    <p className={styles.navLinks}>{t("app.title")}</p>
                </div>
                <ul className={styles.navLinks}>
                    <li><a href="#home">{t("landingPage.nav.home")}</a></li>
                    <li><a href="#features">{t("landingPage.nav.features")}</a></li>
                    <li><a href="#about">{t("landingPage.nav.about")}</a></li>
                </ul>
            </nav>
            <div id="home" className={styles.landingContainer}>
                <div className={styles.landingFlexContent}>
                    <div className={styles.landingContent}>
                        <h1>{t("landingPage.hero.title")}</h1>
                        <p>{t("landingPage.hero.description")}</p>
                        <button
                            className={`btn ${styles.getStartedButton}`}
                            onClick={() => navigate("/login")}
                        >
                            {t("landingPage.hero.getStarted")}
                        </button>
                    </div>
                    <img
                        src="images/iPhone_16_Mockup.png"
                        alt="Phone Thumbnail"
                        className={styles.phoneThumbnail}
                    />
                </div>
            </div>
            <div id="features" className={styles.featuresSection}>
                <div className={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.featureCard}>
                            <Feature
                                title={feature.title}
                                description={feature.description}
                                icon={feature.icon}
                            />
                        </div>
                    ))}
                </div>
                <button
                    className={`btn ${styles.getStartedButton}`}
                    onClick={() => navigate("/login")}
                >
                    {t("landingPage.hero.getStarted")}
                </button>
            </div>
            <div id="about" className={styles.aboutSection}>
                <div className={styles.aboutCard}>
                    <img
                        src="images/icon.png"
                        alt="Gifteo Logo"
                        className={styles.aboutImage}
                    />
                    <h2>{t("landingPage.about.title")}</h2>
                    <p>{t("landingPage.about.description1")}</p>
                    <p>{t("landingPage.about.description2")}</p>
                </div>
            </div>
            <div className={styles.footer}>
                <p>{t("landingPage.footer.copyright")}</p>
            </div>
        </>
    );
};

export default LandingPage;