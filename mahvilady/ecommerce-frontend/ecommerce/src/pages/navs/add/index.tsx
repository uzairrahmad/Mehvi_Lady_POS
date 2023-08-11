import { Fragment, useEffect, useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import Card from "@component/Card";
import CheckBox from "@component/CheckBox";
import FlexBox from "@component/FlexBox";
import Grid from "@component/grid/Grid";
import DropZone from "@component/DropZone";
import { Button } from "@component/buttons";
import TextField from "@component/text-field";
import AdminDashboardLayout from "@component/layout/admin-dashboard";
import DashboardPageHeader from "@component/layout/DashboardPageHeader";
import { H6 } from "@component/Typography";
import { Accept } from "react-dropzone";
import Image from "@component/Image";
import { theme } from "@utils/theme";
import styled from "styled-components";
import Box from "@component/Box";
import navApi from "@utils/real_api/category-nav-api";
import showAlert from "@utils/show-alert"; // Import the custom showAlert function
import Router from "next/router";
import Select from "@component/Select";
import { getListOfSelectedValues } from "@utils/common-utils";
import {Option} from "../../../interfaces/index";
import { useUserRoleValidation } from "@component/RBAC";
import { UserRole } from "@models/user.model";


const UploadImageBox = styled(Box)({
    width: 70,
    height: 70,
    display: "flex",
    overflow: "hidden",
    borderRadius: "8px",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.gray[100],
});


const AddCategoryNav = () => {


    const [selectedImage, setSelectedImage] = useState(null);
    const [imageChange, setImageChange] = useState(false);
    const [submissionInprogress, setSubmissionInprogress] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState<Option[]>([]);
    useUserRoleValidation([UserRole.ADMIN]);

    const accept: Accept = { "image": ["image/svg+xml"] }
    


    const fetchOptions = async () => {
        try {
          const data = await navApi.getNavigations(); 
          // Assuming the API response is an array of objects with label and value fields
          setOptions(data.map((item) => ({
            value: item.id,
            label: item.title,
          })));
        } catch (error) {
          console.error('Error fetching options:', error);
        }
      };
    
      useEffect(() => {
        // Fetch the options when the component mounts
        fetchOptions();
      }, []);

    const initialValues = {
        icon: null,
        title: null,
        href: null,
        displayOrder: null,
        mainNav: false,
        featured: false,
        children: [],

    };
    const checkoutSchema = yup.object().shape({
        title: yup.string().trim().min(3).required(),
        href: yup.string().trim().min(1).required(),
        mainNav: yup.boolean().required(),
        featured: yup.boolean().required(),
        displayOrder: yup.number().positive().required()
    });

    const handleFormSubmit = async (values) => {
        let formData = new FormData();
        console.log(`called ${JSON.stringify(values)}`);
        if (submissionInprogress) {
            showAlert("previous submission in-progress", "warn");
        } else if (selectedImage === undefined || selectedImage === null) {
            showAlert("Please select an image.", "warn");
        } else {

            setSubmissionInprogress(true);
            try {
                formData.append('file', selectedImage[0]);
                formData.append('nav', JSON.stringify(values));
                const response = await navApi.postNavigation(formData);
                console.log(response.data);
                // Display a success alert
                console.log('file change')

                showAlert("Nav Added.", "success");
            } catch (error) {
                console.error('Error uploading file:', error);
                showAlert("Ops Error occur.", "error");

            } finally {
                setSubmissionInprogress(false);
            }

        }
    };

    function choseUpload(files) {
        console.log("file");
        setSelectedImage(files);
        setImageChange(true);
    }

    const handleGoBack = () => Router.push("/navs");

    const HEADER_LINK = (
        <Button color="primary" bg="primary.light" px="2rem" onClick={handleGoBack}>
            Back to Navigatins List
        </Button>
    );


    return (
        <Fragment>
            <DashboardPageHeader title="Add Nav Item" iconName="services-icon" button={HEADER_LINK} />
            {<Card p="30px">
                <Formik
                    onSubmit={handleFormSubmit}
                    initialValues={initialValues}
                    validationSchema={checkoutSchema}

                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={6}>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        fullwidth
                                        name="title"
                                        label="Title"
                                        placeholder="title"
                                        onBlur={handleBlur}
                                        value={values.title}
                                        onChange={handleChange}
                                        errorText={touched.title && errors.title}
                                    />
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        fullwidth
                                        name="href"
                                        label="Link"
                                        placeholder="/"
                                        onBlur={handleBlur}
                                        value={values.href}
                                        onChange={handleChange}
                                        errorText={touched.href && errors.href}
                                    />
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        fullwidth
                                        name="displayOrder"
                                        label="Display Order"
                                        placeholder="1"
                                        onBlur={handleBlur}
                                        value={values.displayOrder}
                                        onChange={handleChange}
                                        errorText={touched.displayOrder && errors.displayOrder}
                                    />
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <Select
                                        options={options}
                                        isMulti={true}
                                        label="Sub Nav" // Change "Caterogy" to "Category"
                                        value={selectedOption} // Change "values.country" to "values.category"
                                        placeholder="Select Sub Nav"
                                        errorText={touched.children && errors.children} // Change "tags" to "category"
                                        onChange={(selectedOptions: Option[]) => {
                                            // Get the list of selected values
                                            setSelectedOption(selectedOptions)
                                            console.log(getListOfSelectedValues(selectedOptions))
                                            setFieldValue("children", getListOfSelectedValues(selectedOptions));
                                          }}
                                    />
                                </Grid>
                               
                                <Grid item xs={12}>
                                    <DropZone onChange={choseUpload} label="drop icon here"
                                        accept={accept} maxFiles={1} multiple={false} sublable="uplaod a svg file"
                                    />
                                    <FlexBox flexDirection="row" mt={2} flexWrap="wrap">
                                        {imageChange && <UploadImageBox key={1} mr=".5rem">
                                            <Image src={URL.createObjectURL(selectedImage[0])} width="100%" />
                                        </UploadImageBox>
                                        }
                                    </FlexBox>
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <CheckBox
                                        mb="1.75rem"
                                        name="mainNav"
                                        color="secondary"
                                        onChange={handleChange}
                                        checked={values.mainNav}
                                        label={
                                            <FlexBox>
                                                <H6>Main Nav</H6>
                                            </FlexBox>
                                        }
                                    />
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <CheckBox
                                        mb="1.75rem"
                                        name="featured"
                                        color="secondary"
                                        onChange={handleChange}
                                        checked={values.featured}
                                        label={
                                            <FlexBox>
                                                <H6>Featured</H6>
                                            </FlexBox>
                                        }
                                    />
                                </Grid>
                            </Grid>


                            <Button mt="25px" variant="contained" color="primary" type="submit" disabled={submissionInprogress}>
                                Save
                            </Button>
                        </form>
                    )}
                </Formik>
            </Card>
            }
        </Fragment>
    );
};

AddCategoryNav.layout = AdminDashboardLayout;

export default AddCategoryNav;
