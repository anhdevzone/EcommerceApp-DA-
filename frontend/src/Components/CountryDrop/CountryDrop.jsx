import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import { Dialog } from "@mui/material";
import { FaAngleDown } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { IoIosCloseCircleOutline } from "react-icons/io";
import "./CountryDrop.css";
import { MyContext } from "../../App";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CountryDrop = () => {
  const [isOpenModal, setisOpenModal] = useState(false);
  const [selectedTab, setSlectedTab] = useState(null);

  const [countryList, setcountryList] = useState([]);
  const context = useContext(MyContext);
  const selectCountry = (index, country) => {
    setSlectedTab(index);
    // alert(selectedTab);
    setisOpenModal(false);
    context.setSelectedCountry(country);
    localStorage.setItem("location", country)
    window.location.href = window.location.href
  };

  useEffect(() => {
    setcountryList(context.countryList);
  }, []);

  const filterList = (e) => {
    const keyword = e.target.value.toLowerCase();
    if (keyword !== "") {
      const list = countryList.filter((item) => {
        return item.country.toLowerCase().includes(keyword);
      });

      setcountryList(list);
    } else {
      setcountryList(context.countryList);
    }
  };
  return (
    <div>
      <Button className="countryDrop" onClick={() => setisOpenModal(true)}>
        <div className="info d-flex flex-column">
          <span className="lable">Quốc Gia</span>
          <span className="name">
            {context.selectedCountry !== ""
              ? context.selectedCountry.length > 10
                ? context.selectedCountry?.substr(0, 10) + "..."
                : context.selectedCountry
              : "Select Location"}
          </span>
        </div>
        <span className="ml-auto icon-angle">
          <FaAngleDown />
        </span>
      </Button>
      <Dialog
        open={isOpenModal}
        onClose={() => setisOpenModal(false)}
        className="locationModal"
        TransitionComponent={Transition}
      >
        <h3>Chọn quốc gia của bạn</h3>
        <p>Tìm kiếm quốc gia của bạn chúng tôi sẽ chỉ định</p>
        <Button className="close_" onClick={() => setisOpenModal(false)}>
          <IoIosCloseCircleOutline />
        </Button>
        <div class="headerSearch ml-3 mr-3">
          <input
            type="text"
            placeholder="Search your area..."
            onChange={filterList}
          />
          <Button>
            <IoSearch />
          </Button>
        </div>
        <ul className="countryList mt-3">
          <li>
            <Button
              onClick={() => selectCountry(0, "All")}
            >
             All
            </Button>
          </li>
          {countryList?.length !== 0 &&
            countryList?.map((item, index) => {
              return (
                <li key={index}>
                  <Button
                    onClick={() => selectCountry(index + 1, item.country)}
                    className={`${selectedTab === index + 1 ? "active" : ""}`}
                  >
                    {item.country}
                  </Button>
                </li>
              );
            })}
        </ul>
      </Dialog>
    </div>
  );
};

export default CountryDrop;
