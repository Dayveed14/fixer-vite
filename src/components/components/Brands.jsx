import "../css/Brands.css";

const BRANDS = ["Apple","Samsung","Dell","HP","Lenovo","Sony","Microsoft","Asus","Acer","LG","Huawei","OnePlus","Google","Motorola","Toshiba","Xiaomi","Razer","MSI","Alienware","Surface"];
const ICONS = {Apple:"🍎",Samsung:"📱",Dell:"💻",HP:"🖨️",Lenovo:"⌨️",Sony:"🎮",Microsoft:"🪟",Asus:"🔧",Acer:"⚡",LG:"📺",Huawei:"📡",OnePlus:"🔴",Google:"🔍",Motorola:"📻",Toshiba:"💾",Xiaomi:"🔆",Razer:"🐍",MSI:"🎯",Alienware:"👽",Surface:"🖥️"};

export default function Brands() {
  const doubled = [...BRANDS, ...BRANDS];
  return (
    <div className="brands">
      <p className="brands__label">We handle all major brands</p>
      <div className="brands__track-wrapper">
        <div className="brands__track">
          {doubled.map((b, i) => (
            <div className="brands__chip" key={i}>
              <span className="brands__chip-icon">{ICONS[b]}</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
