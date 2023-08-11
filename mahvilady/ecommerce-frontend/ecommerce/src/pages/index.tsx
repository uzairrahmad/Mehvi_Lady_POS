import { Fragment } from "react";
import { GetStaticProps } from "next";
//import Box from "@component/Box";
import { Footer2 } from "@component/footer";
import Section1 from "@sections/health-beauty/Section1";
//import Section2 from "@sections/health-beauty/Section2";
import Section3 from "@sections/health-beauty/Section3";
import Section4 from "@sections/health-beauty/Section4";
import Section5 from "@sections/health-beauty/Section5";
import SideNavbar2 from "@component/sidenav/SideNavbar2";
import SidenavContainer from "@component/SidenavContainer";
import GroceryLayout from "@component/layout/GroceryLayout";
import serviceApi from "@utils/real_api/service-api";
import carouselApi from "@utils/real_api/carousel-item-api";
import categoryNavApi from "@utils/real_api/category-nav-api";
import categoryApi from "@utils/real_api/category-api";
import productApi from "@utils/real_api/product-api";
// data models
import Service from "@models/service.model";
import Product from "@models/product.model";
import { HealthCarouselItem } from "@models/carousel.model";
import { CategoryItem } from "@models/categoryNavList.model";
import Category from "@models/category.model";
import { convertCategoryToCategoryItem } from "@utils/common-utils";

// ===========================================================
type HealthAndBeautyProps = {
  serviceList: Service[];
  allProducts: Product[];
  topNewProducts: Product[];
  navigationList: CategoryItem[];
  catogries: Category[];
  mainCarouselData: HealthCarouselItem[];
};
// ===========================================================

const HealthBeautyShop = (props: HealthAndBeautyProps) => {
  const FIXED_ID = "banner-area";
  //const [page,setPage] = useState(0);
  //const [loddMore,setLoadMore] = useState(true);

  
  return (
    <Fragment>
      {/* HERO CAROUSEL AREA */}
      <Section1 id={FIXED_ID} carouselData={props.mainCarouselData} />

      {/* SIDEBAR WITH MAIN CONTENT AREA */}
      <SidenavContainer
        navFixedComponentID={FIXED_ID}
        SideNav={() => <SideNavbar2 navList={props.navigationList} />}
      >
        {/* BANNER AREA */}
        {/* <Box mb="4rem">
          <Section2 />
        </Box> */}

        {/* TOP NEW PRODUCTS AREA */}
        <Section3 title="Top New Products" products={props.topNewProducts} />

        {/* ALL PRODUCTS AREA */}
        <Section4 products={props.allProducts} />

        {/* SERVICES AREA */}
        <Section5 services={props.serviceList} />

        {/* FOOTER AREA */}
        <Footer2 />
        </SidenavContainer>
     
    </Fragment>
  );
};

HealthBeautyShop.layout = ({ children }) => (
  <GroceryLayout showNavbar={false}>{children}</GroceryLayout>
);

export const getStaticProps: GetStaticProps = async () => {
  const mainCarouselData = await carouselApi.getCarousels();
  const serviceList = await serviceApi.get();
  const navs = await categoryNavApi.getNavigations();
  const allProducts = await productApi.getTopNewProduct();
  const topNewProducts = (await productApi.getByPaging(0,'creationTimeStamp,desc')).data;
  const categories = await  categoryApi.get();
  const newCategoryItems: CategoryItem[] = categories.map((category) => convertCategoryToCategoryItem(category));
  const navigationList = [...navs,...newCategoryItems]
  return { props: { serviceList, allProducts, topNewProducts, navigationList, mainCarouselData } };
};



export default HealthBeautyShop;
