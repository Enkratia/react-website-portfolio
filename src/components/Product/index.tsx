import React from "react";
import { Link, useParams } from "react-router-dom";
import { useMediaQuery } from "../../util/customHooks";
import { getCartFromLS } from "../../util/customFunctions";

import { ProductType } from "../../redux/backendApi/types";
import { CartProductType } from "../../redux/cartSlice/types";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { addToCart, setCountCart } from "../../redux/cartSlice/slice";
import { openCart } from "../../redux/headerCartBtnSlice/slice";
import { selectHeaderCartBtn } from "../../redux/headerCartBtnSlice/selectors";
import { selectSingleProduct } from "../../redux/singleProductSlice/selectors";
import { setSpColor, setSpSize } from "../../redux/singleProductSlice/slice";

import { FavoriteBtn } from "../FavoriteBtn";

import s from "./Product.module.scss";
import cs from "../../scss/global/_index.module.scss";
import { AngleDown, Cart, Star2 } from "../../iconComponents";

const productMB = 80; // для box-shadow в слайдере

type ProductProps = {
  obj: ProductType;
  theme?: string;
  mode?: string;
  isSlider?: boolean;
  isPermanentHover?: boolean;
  isCommon?: boolean;
};

type ProductCartBtnProps = {
  obj: ProductType;
  count?: string;
  activeColor: number | undefined;
  activeSize: number | undefined;
  isActiveBtn: boolean;
  setIsActiveBtn: (b: boolean) => void;
  selectRef?: React.RefObject<HTMLDivElement>;
};

export const ProductCartBtn: React.FC<ProductCartBtnProps> = ({
  obj,
  count = "1",
  activeColor,
  activeSize,
  isActiveBtn,
  setIsActiveBtn,
  selectRef,
}) => {
  const dispatch = useAppDispatch();
  const isCartOpen = useAppSelector(selectHeaderCartBtn);

  React.useEffect(() => {
    if (!isCartOpen) return;
    setIsActiveBtn(false);
  }, [isCartOpen]);

  const onAddToCartClick = () => {
    if (activeSize && activeSize < 0) {
      const firstLi = selectRef?.current?.lastElementChild?.firstElementChild?.firstElementChild;
      (firstLi as HTMLLIElement)?.click(); // валидировать селект при первом клике на productCartBtn, если не выбран option

      return; // отрицательный размер = выбран плейсхолдер селекта = игнорировать добавление в корзину
    }

    let isExist;

    if (isActiveBtn) {
      dispatch(openCart());
      return;
    }

    let productHash = obj.title;
    if (activeColor !== undefined) {
      productHash += obj.color[activeColor];
    }
    if (activeSize !== undefined) {
      productHash += obj.size[activeSize];
    }

    let cartProducts = getCartFromLS() as CartProductType[];

    for (let product of cartProducts) {
      let cartProductHash = product.obj.title;
      if (product.color !== undefined) {
        cartProductHash += product.color;
      }
      if (product.size !== undefined) {
        cartProductHash += product.size;
      }

      if (cartProductHash === productHash && product.count === count) {
        isExist = true;
        break;
      }
    }

    setIsActiveBtn(true);

    if (isExist) return;

    const productData = {
      count: count,
      hash: productHash,
      obj,
    } as CartProductType;

    if (activeColor !== undefined) {
      productData.color = obj.color[activeColor];
    }
    if (activeSize !== undefined) {
      productData.size = obj.size[activeSize];
    }

    let filteredCartProducts = cartProducts.filter((cartProduct) => {
      let cartProductHash = cartProduct.obj.title;
      if (cartProduct.color !== undefined) {
        cartProductHash += cartProduct.color;
      }
      if (cartProduct.size !== undefined) {
        cartProductHash += cartProduct.size;
      }

      if (productHash === cartProductHash) {
        return false;
      }

      return true;
    });

    if (cartProducts.length === filteredCartProducts.length) {
      dispatch(addToCart(productData));
    } else {
      dispatch(setCountCart({ count: count, hash: productHash }));
    }
  };

  return (
    <button
      onClick={onAddToCartClick}
      className={`${s.buttonCart} ${cs.btn} ${cs.btnMid} ${isActiveBtn ? cs.btnOutline : ""} ${
        isActiveBtn ? s.buttonCartActive : ""
      }`}>
      <Cart aria-hidden="true" />
    </button>
  );
};

export const Product: React.FC<ProductProps> = ({
  obj,
  theme,
  mode,
  isSlider = true,
  isPermanentHover = false,
  isCommon = false,
}) => {
  const dispatch = useAppDispatch();
  // const { singleProductID } = useParams();
  const { spColor, spSize } = useAppSelector(selectSingleProduct); // для singleProductPage страницы хранить цвет/размер в редаксе

  const { isMQ1024 } = useMediaQuery();
  const prodRef = React.useRef<HTMLElement>(null);
  const botRef = React.useRef<HTMLDivElement>(null); // (для slider)

  const [activeImg, setActiveImg] = React.useState(0);
  const [activeSize, setActiveSize] = React.useState(0);
  const [activeColor, setActiveColor] = React.useState(0);
  const [isActiveBtn, setIsActiveBtn] = React.useState(false);

  const onTestEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!isMQ1024 || !isSlider) return;

    const list = e.currentTarget.closest(".slick-list") as HTMLDivElement;
    const listMarginBottom = window.getComputedStyle(list).marginBottom;

    if (botRef.current) {
      botRef.current.setAttribute("data-visible", "");
      const bottomHeight = botRef.current?.getBoundingClientRect().height;
      list.style.marginBottom = parseFloat(listMarginBottom) - productMB - bottomHeight + "px";
    }
  };

  const onTestLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (!isMQ1024 || !isSlider) return;

    const list = e.currentTarget.closest(".slick-list") as HTMLDivElement;
    list.style.marginBottom = "";
    botRef.current?.removeAttribute("data-visible");
  };

  const onColorBtnClick = (index: number) => {
    setIsActiveBtn(false);

    if (isCommon) {
      dispatch(setSpColor(index));
    } else {
      setActiveColor(index);
    }
  };

  const onSizeBtnClick = (index: number) => {
    setIsActiveBtn(false);

    if (isCommon) {
      dispatch(setSpSize(index + 1));
    } else {
      setActiveSize(index);
    }
  };

  const onPrevClick = () => {
    if (activeImg === 0) {
      setActiveImg(obj.imageUrls.length - 1);
      return;
    }
    setActiveImg((n) => n - 1);
  };

  const onNextClick = () => {
    if (activeImg === obj.imageUrls.length - 1) {
      setActiveImg(0);
      return;
    }
    setActiveImg((n) => n + 1);
  };

  return (
    <article
      ref={prodRef}
      onMouseEnter={onTestEnter}
      onMouseLeave={onTestLeave}
      className={`${s.root} ${isSlider ? "" : s.rootNoJsHover}`}>
      <div className={s.look}>
        <div className={s.microslider}>
          <Link to={obj.linkUrl} draggable="false">
            <img
              src={obj.imageUrls[activeImg]}
              alt="Product image."
              className={s.microsliderImage}
            />
          </Link>

          <div className={s.microsliderBtns}>
            <button
              onClick={onPrevClick}
              className={`${s.microsliderBtn} ${s.microsliderBtnLeft}`}
              aria-label="Go to the previous image of the product.">
              <AngleDown aria-hidden="true" />
            </button>

            <button
              onClick={onNextClick}
              className={`${s.microsliderBtn} ${s.microsliderBtnRight}`}
              aria-label="Go to the next image of the product.">
              <AngleDown aria-hidden="true" />
            </button>
          </div>
        </div>

        {obj.rating > 0 && (
          <div className={s.rating}>
            {[...Array(5)].map((_, i) => (
              <Star2
                key={i}
                className={`${s.ratingIcon} ${obj.rating > i ? s.ratingIconActive : ""}`}
              />
            ))}
          </div>
        )}

        <FavoriteBtn index={obj.id} />

        {obj.discount > 0 && <div className={s.discount}>{`-${obj.discount}%`}</div>}
      </div>

      <div className={`${s.info} ${theme ? "" : s.infoWhite}`}>
        <Link to={obj.linkUrl} className={s.name}>
          {obj.title}
        </Link>

        <div className={s.prices}>
          <span
            className={`${s.price} ${mode === "lg" ? s.priceLg : ""} ${
              obj.oldPrice > 0 ? s.priceRed : ""
            }`}>{`$${obj.price.toFixed(2)}`}</span>

          {obj.oldPrice > 0 && (
            <span
              className={`${s.oldPrice} ${
                mode === "lg" ? s.oldPriceLg : ""
              }`}>{`$${obj.oldPrice.toFixed(2)}`}</span>
          )}
        </div>

        <div ref={botRef} className={`${s.bottom} ${isPermanentHover ? s.bottomPermanent : ""}`}>
          <div className={s.details}>
            <ul className={`${cs.ulReset} ${s.sizes}`}>
              {obj.size.length > 0 &&
                obj.size.map((size, i) => (
                  <li key={i} className={s.sizesItem}>
                    <button
                      onClick={() => onSizeBtnClick(i)}
                      className={`${s.sizesBtn} ${
                        ((isCommon && spSize - 1) || activeSize) === i ? s.sizesBtnActive : ""
                      }`}>
                      {size}
                    </button>
                  </li>
                ))}
            </ul>

            <ul className={`${s.colors} ${cs.ulReset}`}>
              {obj.color.length > 0 &&
                obj.color.map((color, i) => (
                  <li key={i} className={s.colorsItem}>
                    <button
                      onClick={() => onColorBtnClick(i)}
                      data-color={color}
                      className={`${cs.colorBtn} ${
                        ((isCommon && spColor) || activeColor) === i ? cs.colorBtnActive : ""
                      }`}
                      aria-label={`Choose ${color} color`}></button>
                  </li>
                ))}
            </ul>
          </div>

          <ProductCartBtn
            obj={obj}
            activeColor={isCommon ? spColor : activeColor}
            activeSize={isCommon ? spSize - 1 : activeSize}
            isActiveBtn={isActiveBtn}
            setIsActiveBtn={setIsActiveBtn}
          />
        </div>
      </div>
    </article>
  );
};
