import './AboutPage.scss';

function AboutPage() {
    return (
        <div className="about-page">
            <div className="container">
                <header className="about-header">
                    <h1 className="about-title">About Us</h1>
                    <div className="underline"></div>
                </header>
                <section className="about-content">
                    <p>
                        Welcome to <strong>HomeFinder</strong>, your ultimate destination for discovering the perfect home. Whether you're looking to buy, rent, or simply explore the real estate market, we've got you covered. Our platform offers a wide range of properties, from cozy apartments to luxurious villas, tailored to meet your needs.
                    </p>
                    <p>
                        Our team is dedicated to providing you with a seamless and enjoyable experience. We leverage the latest technology and insights to ensure that you have access to the most accurate and up-to-date information about the housing market. Our user-friendly interface and advanced search features make finding your dream home easier than ever.
                    </p>
                    <p>
                        At HomeFinder, we believe that finding a home should be a joyful and stress-free process. Our goal is to connect you with the perfect property and support you every step of the way. If you have any questions or need assistance, our friendly customer support team is here to help.
                    </p>
                    <p>
                        Thank you for choosing HomeFinder. We look forward to helping you find your next home!
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
