import "./HomePage.scss";
import bgImage from "../../Assets/bg.jpg";


function HomePage() {

  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">Find your best home</h1>
          <p>
            Welcome to HouseFinder, your ultimate platform for discovering your
            next home! Browse through a vast selection of properties for sale
            and rent, with detailed listings and high-quality photos. Whether
            you're looking for a downtown apartment or a countryside villa, we
            have the perfect option for you. With just a few clicks, you can
            easily contact sellers or landlords to get more information or
            schedule a viewing. Your next home is just a click away!
          </p>
        </div>
      </div>
      <div className="imgContainer">
        <img src={bgImage} alt="" />
      </div>
    </div>
  );
};

export default HomePage;
