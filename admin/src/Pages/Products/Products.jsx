import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import {
  Breadcrumbs,
  Chip,
  CircularProgress,
  MenuItem,
  Pagination,
  Select,
} from '@mui/material';
import mongoose from 'mongoose';
import React, { useContext, useEffect, useState } from 'react';
import { deleteData, editData, fetchDataFromApi } from '../../utils/api';
import './Products.css';

// Assuming `context` is your Progress context
import { MyContext } from '../../App';
import ProductDeleteDialog from './Components/ProductDeleteDialog/ProductDeleteDialog';
import ProductEditDialog from './Components/ProductEditDialog/ProductEditDialog';
import ProductsTable from './Components/ProductsTable/ProductsTable';

const Products = () => {
  const [open, setOpen] = useState(false);
  const [showBy, setShowBy] = useState('');

  const [pRamData, setPRamData] = useState([]);
  const [pWeigthData, setPWeigthData] = useState([]);
  const [pSizeData, setPSizeData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);
  const [catData, setCatData] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [deleteID, setDeleteID] = useState(null);
  const [EditP, setEditP] = useState(null);
  const [subCatVal, setSubCatVal] = useState();
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1); 
  const context = useContext(MyContext);
  const [formFields, setFormFields] = useState({
    name: "",
    description: "",
    images: [],
    brand: "",
    price: "",
    oldPrice: "",
    category: "",
    subCat: "",
    catName: "",
    subName: "",
    countInStock: "",
    discount: "",
    weightName: [],
    ramName: [],
    sizeName: [],
    isFeatured: false,
    location : ""
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [prams, weights, sizes] = await Promise.all([
          fetchDataFromApi('/api/prams'),
          fetchDataFromApi('/api/weight'),
          fetchDataFromApi('/api/psize'),
        ]);
        setPRamData(prams.data || []);
        setPWeigthData(weights.data || []);
        setPSizeData(sizes.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDataFromApi('/api/category')
      .then((res) => {
        if (Array.isArray(res.categoryList)) {
          setCatData(res.categoryList);
        } else {
          setCatData([]);
        }
      })
      .catch((error) => {
        console.error('Lỗi khi lấy danh mục:', error);
        setCatData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetchDataFromApi(`/api/subCategory`);
      setsubCatData(response); 
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    context.setProgress(30);
    fetchCategories(context.setProgress(100));
  }, []);

  const handleSelectChange = (e, fieldName) => {
    setFormFields((prev) => ({
      ...prev,
      [fieldName]: e.target.value,
    }));

    if (fieldName === "category") {
      fetchSubCategoriesByCategory(e.target.value);
    }
  };

  const fetchSubCategoriesByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const res = await fetchDataFromApi(`/api/subCategory?categoryId=${categoryId}`);
      if (Array.isArray(res.data)) {
        setSubCatData(res.data);
      } else {
        setSubCatData([]);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubCatData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetchDataFromApi(
        `/api/products?page=${page}&perPage=10`
      );
      console.log('API Response:', response);
      if (response && response.data) {
        setProductList(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.currentPage || page);
      } else {
        setProductList([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error);
      context.setAlertBox({
        error: true,
        msg: 'Lấy sản phẩm thất bại',
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false); 
    setDeleteID(null); 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  const handleOpenDeleteDialog = (_id) => {
    setDeleteID(_id); 
    setOpenDeleteDialog(true); 
  };

  const changeInput = (e) => {
    setFormFields((prevFields) => ({
      ...prevFields,
      [e.target.name]: e.target.value, 
    }));
  };

  const selectCat = (cat) => {
    formFields.catName = cat;
  };

  const handleSelectSubCatChange = (e) => {
    setSubCatVal(e.target.value);
    setFormFields(() => ({
      ...formFields,
      subCat: e.target.value,
    }));
    formFields.subName = e.target.value;
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value); 
    fetchProducts(value); 
  };

  const handleClose = () => {
    setOpen(false); 
  };

  const handleEditP = async (_id) => {
    setOpen(true);
    setEditP(_id);
    try {
      const res = await fetchDataFromApi(`/api/products/${_id}`);
      if (res) {
        console.log('Fetched product data:', res);

        setFormFields({
          name: res.name,
          description: res.description,
          brand: res.brand || "",
          price: res.price || "",
          oldPrice: res.oldPrice || "",
          category: res.category ? res.category.name : "",
          subCat: res.subCat || "",
          subName: res.subName,
          catName: res.catName || "",
          countInStock: res.countInStock || "",
          location: res.location || "",
          isFeatured: res.isFeatured || false,
          discount: res.discount || "",
          weightName: res.weightName ? res.weightName.join(",") : "", 
          ramName: res.ramName ? res.ramName.join(",") : "", 
          sizeName: res.sizeName ? res.sizeName.join(",") : "", 
        });

        console.log('Images from API:', res.images);
        setPreviews(res.images || []);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm để chỉnh sửa:', error);
    }
  };

  const editPFun = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updatedPrice =
      Number(formFields.oldPrice) -
      (Number(formFields.oldPrice) * (Number(formFields.discount) || 0)) / 100;

    try {
      const formData = new FormData();
      console.log('Form data before append:');
      console.log('weightName:', formFields.weightName);
      console.log('ramName:', formFields.ramName);
      console.log('sizeName:', formFields.sizeName);

      formData.append('name', formFields.name?.trim() || '');
      formData.append('description', formFields.description?.trim() || '');
      formData.append('brand', formFields.brand?.trim() || '');
      formData.append('price', `${Number(updatedPrice) || 0}`);
      formData.append('oldPrice', `${Number(formFields.oldPrice) || 0}`);
      formData.append('category', formFields.category?.trim() || '');
      formData.append('subCat', formFields.subCat?.trim() || '');
      formData.append('catName', formFields.catName || '');
      formData.append('subName', formFields.subName || '');
      formData.append("location", formFields.location || "");
      formData.append('countInStock', Number(formFields.countInStock) || 0);
      formData.append('discount', formFields.discount || 0);
      formData.append('isFeatured', Boolean(formFields.isFeatured));

      if (formFields.weightName)
        formData.append('weightName', formFields.weightName);
      if (formFields.ramName) formData.append('ramName', formFields.ramName);
      if (formFields.sizeName) formData.append('sizeName', formFields.sizeName);

      const existingImages = previews.filter(
        (preview) => typeof preview === 'string' && preview.startsWith('http')
      );
      if (existingImages.length > 0) {
        existingImages.forEach((image) =>
          formData.append('existingImages[]', image)
        );
      }

      if (files.length > 0) {
        files.forEach((file) => {
          if (file instanceof File) formData.append('images', file);
        });
      }
      await editData(`/api/products/${EditP}`, formData).then(async (res) => {
        setLoading(false);
        setPreviews([]); 
        setFiles([]); 
        await fetchProducts(); 
        handleClose(); 
        context.setAlertBox({
          error: false,
          msg: 'Cập nhật sản phẩm thành công',
          open: true,
        });
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      context.setAlertBox({
        error: true,
        msg:
          error.response?.data?.message ||
          error.message ||
          'Cập nhật sản phẩm thất bại',
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    context.setProgress(30);

    try {
      await deleteData(`/api/products/${deleteID}`);
      context.setProgress(70); 
      await fetchProducts(); 
      context.setProgress(100); 
      handleCloseDeleteDialog(); 
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      context.setProgress(0); 
    }
  };

  const onChangeFile = (e) => {
    if (e?.target?.files) {
      const maxSize = 5 * 1024 * 1024; 
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter((file) => {
        if (file.size > maxSize) {
          context.setAlertBox({
            error: true,
            msg: `File ${file.name} quá lớn. Kích thước tối đa là 5MB`,
            open: true,
          });
          return false;
        }

        if (!allowedTypes.includes(file.type)) {
          context.setAlertBox({
            error: true,
            msg: `File ${file.name} không phải là loại hình ảnh được hỗ trợ`,
            open: true,
          });
          return false;
        }

        return true;
      });

      setFiles((prevFiles) => [...prevFiles, ...validFiles]);

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
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
  useEffect(() => {
    fetchProducts();

    return () => {
      previews.forEach((preview) => {
        if (typeof preview === 'string' && !preview.startsWith('http')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, []);

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-4 w-100">
        <div className="MuiBox-root css-99a237 d-flex">
          <h6 className="MuiTypography-root MuiTypography-h6 css-66yapz-MuiTypography-root">
            Danh sách sản phẩm hiện có
          </h6>
          <Breadcrumbs
            style={{ color: '#FFF' }}
            aria-label="breadcrumb"
            className="ml-auto breadcrumbs_"
          >
            <Chip
              style={{ color: '#FFF' }}
              component="a"
              href="/"
              label="Bảng điều khiển"
              icon={<HomeIcon style={{ color: '#FFF' }} fontSize="small" />}
            />
            <Chip
              style={{ color: '#FFF' }}
              href="#"
              label="Sản phẩm"
              icon={<ExpandMoreIcon />}
            />
          </Breadcrumbs>
        </div>
        <div className="row cardFilter mt-4">
          <div className="col-md-3">
            <h4>HIỂN THỊ THEO</h4>
            <Select
              value={formFields.category || ''}
              onChange={(e) => handleSelectChange(e, 'category')}
              displayEmpty
              className="w-100"
            >
              <MenuItem value="">
                <em>Không có</em>
              </MenuItem>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                catData.map((item, index) => (
                  <MenuItem key={index} value={item._id}>
                    {item.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div>
        </div>
        <ProductsTable
          productList={productList}
          context={context}
          loading={loading}
          handleEditP={handleEditP}
          handleOpenDeleteDialog={handleOpenDeleteDialog}
          isHomePage={false}
        />

        <div className="d-flex tableFooter">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
            color="primary"
            className="pagination"
          />
        </div>
        <ProductDeleteDialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onDelete={handleDeleteConfirm}
        />
        <ProductEditDialog
          open={open}
          handleClose={handleClose}
          changeInput={changeInput}
          handleInputChange={handleInputChange}
          editPFun={editPFun}
          loading={loading}
          formFields={formFields}
          previews={previews}
          onChangeFile={onChangeFile}
          removeFile={removeFile}
          handleSelectChange={handleSelectChange}
          selectCat={selectCat}
          handleSelectSubCatChange={handleSelectSubCatChange}
        />
      </div>
    </div>
  );
};

export default Products;
