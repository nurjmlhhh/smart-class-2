import "../pages/style2.css";
import logoImage from '../assets/images/SmartClass.png';  

export default function Home() {
  return (
    <div className="app-container con">
      <div className="glow-box">
        <div className="content">
          <img src={logoImage} alt="Smart Class Logo" className="logo-image" />
          <div className="text-content">
            <h1 className="glow-text">Welcome to Smart Class!</h1>
            <p className="description">
            Mari jelajahi dunia pengetahuan yang luas tanpa batas. Smart Class menggabungkan teknologi terkini dengan metode pembelajaran yang inovatif, memastikan kamu mendapatkan pengalaman belajar yang efektif dan memuaskan. Bersama kami, pendidikan tidak hanya menjadi sebuah kewajiban, tetapi juga petualangan yang mengasyikkan.
             Siapkah kamu untuk memulai perjalanan ini? Ayo, raih masa depanmu bersama <span className="highlight">Smart Class!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
