import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import {
  Backdrop,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { emphasize, styled } from "@mui/material/styles";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { bgColor } from "../../assets/assets";
import { deleteData, editData, fetchDataFromApi } from "../../utils/api";
import "./Category.css";
import CategoryPagination from "./Components/CategoryPagination/CategoryPagination";
import CategoryTable from "./Components/CategoryTable/CategoryTable";
import DeleteDialog from "./Components/DeleteDialog/DeleteDialog";
import EditCategoryDialog from "./Components/EditCategoryDialog/EditCategoryDialog";

const StyleBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const Category = () => {
  const context = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    subCat: "",
    images: [],
    color: "",
  });
  const [open, setOpen] = useState(false);
  const [catData, setCatData] = useState([]);
  const [editID, setEditID] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteID, setDeleteID] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetchDataFromApi(`/api/category?page=${page}`);
      setCatData(response);
    } catch (error) {
      console.error("Không thể lấy danh sách danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    context.setProgress(30);
    fetchCategories(context.setProgress(100));
  }, []);

  const editCat = async (_id) => {
    setOpen(true);
    setEditID(_id);
    try {
      const res = await fetchDataFromApi(`/api/category/${_id}`);
      if (res) {
        setFormFields({
          name: res.name,
          subCat: res.subCat,
          color: res.color,
        });

        setPreviews(res.images || []);
      }
    } catch (error) {}
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setFormFields({ name: "", subCat: "", images: "", color: "" }); // Đặt lại các trường trong form
  };

  const editCategoryFun = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", formFields.name);
      formData.append("subCat", formFields.subCat);
      formData.append("color", formFields.color);

      previews.forEach((preview, index) => {
        if (typeof preview === "string" && preview.startsWith("http")) {
          formData.append("existingImages", preview);
        }
      });

      files.forEach((file) => {
        formData.append("images", file);
      });

      await editData(`/api/category/${editID}`, formData);

      setPreviews([]);
      setFiles([]);
      await fetchCategories();
      handleClose();

      context.setAlertBox({
        error: false,
        msg: "Sửa thành công",
        open: true,
      });
    } catch (error) {
      console.error("Không thể chỉnh sửa danh mục:", error);
      context.setAlertBox({
        error: true,
        msg: "Lỗi xảy ra khi chỉnh sửa danh mục",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const changeInput = (e) => {
    setFormFields((prevFields) => ({
      ...prevFields,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOpenDeleteDialog = (_id) => {
    setDeleteID(_id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteID(null);
  };

  const handleDeleteConfirm = async () => {
    context.setProgress(30);

    try {
      await deleteData(`/api/category/${deleteID}`);
      context.setProgress(70);
      await fetchCategories();
      context.setProgress(100);
      handleCloseDeleteDialog();
    } catch (error) {
      context.setProgress(0);
    }
  };

  const handleChange = async (event, value) => {
    context.setProgress(30);

    try {
      await fetchCategories(value);
    } catch (error) {
    } finally {
      context.setProgress(100);
    }
  };

  const onChangeFile = (e) => {
    if (e?.target?.files) {
      const filesArray = Array.from(e.target.files);
      setFiles(filesArray);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const removeFile = (index) => {
    setPreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews];
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  console.log(catData);

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 p-3 mt-4 w-100">
          <div className="MuiBox-root css-99a237 d-flex">
            <h6 className="MuiTypography-root MuiTypography-h6 css-66yapz-MuiTypography-root">
              Danh sách danh mục
            </h6>
            <Breadcrumbs
              aria-label="breadcrumb"
              className="ml-auto breadcrumbs_"
            >
              <StyleBreadcrumb
                component="a"
                href="/"
                label="Bảng Điều Khiển"
                icon={<HomeIcon fontSize="small" />}
              />
              <StyleBreadcrumb
                href="#"
                label="Sản Phẩm"
                deleteIcon={<ExpandMoreIcon />}
              />
              <Button className="btn-blue btn-lg">
                <Link style={{ color: "#fff" }} to={"/category/categoryadd"}>
                  Thêm Danh Mục
                </Link>
              </Button>
            </Breadcrumbs>
          </div>

          <div className="table-responsive w-100 mt-5">
            <CategoryTable
              isShowTable={true}
              catData={catData}
              editCat={editCat}
              handleOpenDeleteDialog={handleOpenDeleteDialog}
              isShowIcon={true}
            />

            {/* Footer */}
            <div className="d-flex tableFooter">
              <CategoryPagination
                totalPages={catData.totalPages || 1}
                currentPage={catData.currentPage || 1}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <DeleteDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onDelete={handleDeleteConfirm}
        />

        <EditCategoryDialog
          open={open}
          formFields={formFields}
          handleInputChange={handleInputChange}
          changeInput={changeInput}
          loading={loading}
          bgColor={bgColor}
          editCategoryFun={editCategoryFun}
          handleClose={handleClose}
          previews={previews}
          onChangeFile={onChangeFile}
          removeFile={removeFile}
          isShowEdit={true}
        />

        <Backdrop
          sx={{
            color: "#fff",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            transition: "opacity 0.3s ease-in-out",
            zIndex: 9999,
          }}
          open={loading}
        >
          <CircularProgress color="inherit" size={50} thickness={2} />
        </Backdrop>
      </div>
    </>
  );
};

export default Category;
