import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import React from "react";
import { useImmer } from "use-immer";

import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { ProductsType } from "../../../redux/backendApi/types";
import { setType, setPriceType } from "../../../redux/catalogSlice/slice";
import { selectCatalogFilters } from "../../../redux/catalogSlice/selectors";

import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { OverflowBehavior } from "overlayscrollbars";

import s from "./CatalogFilter.module.scss";
import cs from "../../../scss/global/_index.module.scss";
import { Check, Search } from "../../../iconComponents";

type CatalogFilterProps = {
  title: string;
  types: string[];
  input: boolean;
  init?: boolean;
  theme?: string;
  data: ProductsType;
};

export const CatalogFilter: React.FC<CatalogFilterProps> = ({
  title,
  types,
  data,
  input,
  theme,
  init,
}) => {
  const getMinMaxPrice = () => {
    if (data.length === 0) return ["0", "0"];
    const sortedData = data.slice().sort((a, b) => {
      return a.price > b.price ? 1 : -1;
    });

    return [sortedData[0].price.toFixed(2), sortedData[sortedData.length - 1].price.toFixed(2)];
  };
  const [initialData] = React.useState({ price: getMinMaxPrice(), data: data });
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const topRef = React.useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [filtered, setFiltered] = React.useState<string[]>();
  const [value, setValue] = useImmer("");

  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectCatalogFilters);

  const [price, setPrice] = useImmer(getMinMaxPrice()); // если добавлять каждое изменение сразу в редакс - подвисает слайдер

  React.useEffect(() => {
    if (init && topRef.current) {
      setIsOpen(true);

      const bottom = topRef.current.nextElementSibling as HTMLDivElement;
      const bottomHeight = bottom.scrollHeight;
      bottom.setAttribute("style", `height: ${bottomHeight}px`);
    }
  }, []);

  const getFilterTitle = () => {
    return title === ("clothes" || "shoes" || "accessories") ? "type" : title;
  };

  const onRangeAfterChange = (value: number[]) => {
    const handles = sliderRef.current?.querySelectorAll("[class*=rc-slider-handle]");
    if (!handles) return;
    handles[0].removeAttribute("data-rc-tooltip-1");
    handles[1].removeAttribute("data-rc-tooltip-2");

    dispatch(setPriceType({ prices: [value[0].toFixed(2), value[1].toFixed(2)], coord: 0 }));
  };

  const onRangeChange = (value: number[]) => {
    const value0 = value[0].toFixed(2);
    const value1 = value[1].toFixed(2);

    setPrice([value0, value1]);

    const handles = sliderRef.current?.querySelectorAll("[class*=rc-slider-handle]");
    if (handles) {
      handles[0].setAttribute("data-rc-tooltip-1", "$" + value0);
      handles[1].setAttribute("data-rc-tooltip-2", "$" + value1);
    }
  };

  const onPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const regExp = /\D/gi;

    const newPrice = price.slice();
    newPrice[idx] = e.target.value.replace(regExp, "");
    dispatch(setPriceType({ prices: newPrice, coord: 0 }));

    setPrice((draft) => {
      draft[idx] = e.target.value.replace(regExp, "");
      return draft;
    });
  };

  const capitalize = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const onAccordionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const bottom = e.currentTarget.nextElementSibling as HTMLDivElement;

    if (isOpen) {
      bottom.setAttribute("style", "");
    } else {
      const bottomHeight = bottom.scrollHeight;
      bottom.setAttribute("style", `height: ${bottomHeight}px`);
    }

    setIsOpen((b) => !b);
  };

  const getCount = (type: string) => {
    const amendedTitle =
      title.toLowerCase() === ("clothes" || "shoes" || "accessories")
        ? "type"
        : title.toLowerCase();

    return initialData.data.filter((product) => {
      return (product[amendedTitle] as string | string[]).includes(type.toLowerCase());
    }).length;
  };

  const onSearchBtnClick = () => {
    const filtered = types.filter((type) => type.toLowerCase().includes(value.toLowerCase()));
    setFiltered(filtered);
  };

  const onTypeClick = (e: React.MouseEvent, type: string) => {
    dispatch(setType({ type, title, coord: e.clientY }));
  };

  const scrollbarOptions = {
    overflow: {
      x: (theme === "price" ? "visible" : "hidden") as OverflowBehavior,
    },
    scrollbars: {
      theme: s.osThemeFilter,
    },
  };

  return (
    <div className={`${s.root} ${isOpen ? s.rootShow : ""}`}>
      {/* <!-- Filter-top --> */}
      <button ref={topRef} onClick={onAccordionClick} className={s.top}>
        <h3 className={s.title}>{capitalize(title)}</h3>

        <span
          className={`${s.toggle} ${s.toggleShow} ${cs.toggle}`}
          aria-label="Show or hide the list of the categories."></span>
      </button>

      {/* <!-- Filter-bottom --> */}
      <div className={s.bottom}>
        {input && (
          <div className={s.search}>
            <input
              onChange={(e) => setValue(e.currentTarget.value)}
              type="text"
              className={`${s.searchInput} ${cs.input}`}
              placeholder={`Search the ${title} type.`}
            />

            <button
              onClick={onSearchBtnClick}
              className={s.searchBtn}
              aria-label={`Search input ${title}.`}>
              <Search aria-hidden="true" />
            </button>
          </div>
        )}

        <OverlayScrollbarsComponent
          className={theme === "price" ? s.sliderOverlay : ""}
          options={scrollbarOptions}
          defer>
          {theme === "color" ? (
            <div className={s.colorsWrapper}>
              <ul className={s.colors}>
                {types.map((type) => (
                  <li key={type} className={s.colorsItem}>
                    <button
                      onClick={(e) => onTypeClick(e, type)}
                      data-color={type}
                      className={`${cs.colorBtn} ${cs.colorBtnLg} ${
                        filters[getFilterTitle()].includes(type) ? cs.colorBtnActive : ""
                      }`}
                      aria-pressed={filters[getFilterTitle()].includes(type) ? "true" : "false"}
                      aria-label={`Choose ${type} color.`}>
                      <input
                        type="checkbox"
                        name={`catalog-color-${type}`}
                        id={`catalog-color-${type}`}
                        hidden
                        readOnly></input>
                    </button>

                    <label htmlFor={`catalog-color-${type}`} className={s.colorsName}>
                      {capitalize(type)}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : theme === "price" ? (
            <div ref={sliderRef} className={s.slider}>
              <div className={s.sliderWrapper}>
                <Slider
                  range
                  min={+initialData.price[0]}
                  max={+initialData.price[1]}
                  allowCross={false}
                  onAfterChange={onRangeAfterChange}
                  onChange={onRangeChange}
                  value={[+price[0], +price[1]]}
                />
              </div>

              <div className={s.sliderInputs}>
                <input
                  min={+initialData.price[0]}
                  max={+initialData.price[1]}
                  onChange={(e) => onPriceInputChange(e, 0)}
                  value={price[0]}
                  type="text"
                  className={`${s.sliderInput} ${cs.input}`}
                />

                <div className={s.sliderDivider}></div>

                <input
                  min={+initialData.price[0]}
                  max={+initialData.price[1]}
                  onChange={(e) => onPriceInputChange(e, 1)}
                  value={price[1]}
                  type="text"
                  className={`${s.sliderInput} ${cs.input}`}
                />
              </div>
            </div>
          ) : (
            <ul className={s.list}>
              {filtered && filtered.length === 0 && <li className={s.item}>Not found ...</li>}

              {(filtered || types).map((type, i) => (
                <li key={type} className={s.item}>
                  <div
                    onClick={(e) => onTypeClick(e, type)}
                    className={`${cs.customCheckbox} ${
                      filters[getFilterTitle()].includes(type) ? cs.customCheckboxChecked : ""
                    }`}
                    style={{ marginRight: "13px" }}
                    tabIndex={0}
                    role="checkbox"
                    aria-checked={filters[getFilterTitle()].includes(type) ? "true" : "false"}>
                    <Check aria-hidden="true" />

                    <input type="hidden" name={`${title}-checkbox${i}`} defaultValue="0" />

                    <input
                      type="checkbox"
                      id={`${title}-checkbox${i}`}
                      name={`${title}-checkbox${i}`}
                      defaultValue="1"
                      checked={filters[getFilterTitle()].includes(type)}
                      readOnly
                      hidden
                    />
                  </div>

                  <label htmlFor={`${title}-checkbox${i}`} className={s.label}>
                    <span className={s.name}>{type}</span>
                    <span className={s.count}>({getCount(type)})</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
};
