import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/sidebar/Sidebar'
import Navbar from '../../components/navbar/Navbar'
import './products.scss'
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { publicRequest } from '../../requestMethods';
import { Bars } from 'react-loader-spinner'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../../firebase/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import imageCompression from "browser-image-compression";
const Products = () => {

    const [selectedIndex, setSelectedIndex] = useState(0)
    const [products, setProducts] = useState()
    const [selectedProduct, setSelectedProduct] = useState()
    const [selectedImg, setSelectedImg] = useState(0);
    const [imageLoading, setImageLoading] = useState(false);
    const [title, setTitle] = useState();
    const [progress, setProgress] = useState(0)
    const [productID, setProductID] = useState()
    const [imageName, setImageName] = useState()
    const [description, setDescription] = useState()
    const [category, setCategory] = useState()
    const [MRP, setMRP] = useState()
    const [price, setPrice] = useState()
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const [addNewProduct, setAddNewProduct] = useState(false)

    const [newImages, setNewImages] = useState([]);


    const [newImagesSmall, setNewImagesSmall] = useState();
    const [newImagesThumbnail, setNewImagesThumbnail] = useState();
    const [newImagesNormal, setNewImagesNormal] = useState();

    var loadFlag = 0

    const getProducts = async () => {

        try {
            const res = await publicRequest.get(`/products`, {
                withCredentials: true
            })
            setProducts(res.data)
            if (res.data.length == 0) {
                setAddNewProduct(true)
            }
            console.log(res.data);
            loadFlag += 1

        } catch (error) {

        }
    }
    useEffect(() => {
        if (loadFlag === 0) {


            getProducts()
        }
    }, [])


    const handleUpdate = async (id) => {

        const newProductData = {
            title: title,
            desc: description,
            category: category,
            MRP: MRP,
            price: price,


        }
        try {
            const res = await publicRequest.put(`/products/${products[selectedIndex]._id}`, newProductData, {
                withCredentials: true
            });
            console.log(res.data);
            handleNotification("Success", "Updated")
            getProducts()

        } catch (error) {
            console.log(error);
            handleNotification("Error", error.message)
        }
    }
    const handleNotification = async (type, message) => {
        console.log(type,);
        if (type == 'Success') {
            console.log(successMessage);
            toast.success(message, {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                icon: true,
                theme: "colored",
                // transition:"zoom",

            })
        }
        if (type == 'Error') {

            toast.error(message, {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                icon: true,
                theme: "colored",
            });
        }

    }
    const handleNewProduct = async () => {

        const productData = {
            productID,
            title,
            desc: description,
            category,
            MRP,
            price,
        }
        console.log("pro data", productData);
        try {
            const res = await publicRequest.post('/products/', productData, {
                withCredentials: true
            })
            console.log(res.data);
            getProducts()
            setSuccessMessage("Added")
            handleNotification("Success", "Added")
            let length = products.length;
            console.log(length);
            // setSelectedIndex(length)

        } catch (error) {
            console.log(error);
            setErrorMessage(error.message)
            handleNotification("Error", error.message)
        }

    }

    //Ensure large file not uploaded
    const handleCompressImage = (e) => {

        // e.preventDefault();
        const options = {
            maxSizeMB: 10,
            // maxWidthOrHeight: 500,   
            useWebWorker: true,
        };

        let output;
        imageCompression(newImagesNormal, options).then((x) => {
            output = x;
            const downloadLink = URL.createObjectURL(output);
            setNewImagesNormal(output);
        });

    };

    const handleCompressImageSmallSize = (e) => {
        console.log(newImages);
        // e.preventDefault();
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 200,
            useWebWorker: true,
        };
        let output;
        imageCompression(newImagesNormal, options).then((x) => {
            output = x;
            const downloadLink = URL.createObjectURL(output);
            setNewImagesSmall(output);

            console.log("Compression Completed");

        });

    };
    const handleCompressImageThumbnail = (e) => {
        console.log(newImages);
        // e.preventDefault();
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 50,
            useWebWorker: true,
        };
        let output;
        imageCompression(newImagesNormal, options).then((x) => {
            output = x;
            const downloadLink = URL.createObjectURL(output);
            setNewImagesThumbnail(output);

            console.log("Compression Completed");

        });

    };
    useEffect(() => {
        console.log(newImagesNormal);

        if (newImagesNormal !== undefined && newImagesNormal !== null) {
            console.log("123");
            // handleCompressImage();
            handleCompressImageSmallSize();
            handleCompressImageThumbnail();

        }

    }, [newImagesNormal])

    const handleDeleteImage = async () => {

        if (products && products[selectedIndex] && products[selectedIndex].image) {


            try {
                const res = await publicRequest.put(`/products/${products[selectedIndex]._id}/delete-image`, {
                    //this index is image index
                    selectedIndex: selectedImg,
                });

                console.log(res.data)


                const updatedImages = [...products[selectedIndex].image];
                console.log(updatedImages);
                updatedImages.splice(selectedImg, 1); // Remove the selected image from the array
                const updatedProducts = [...products];
                updatedProducts[selectedIndex] = {
                    ...updatedProducts[selectedIndex],
                    image: updatedImages,
                };
                //update the selected image.
                if (selectedImg > 0) {
                    setSelectedImg(prevIndex => prevIndex - 1)
                }

                setProducts(updatedProducts);
                setSuccessMessage("Deleted")
                handleNotification("Success", "Deleted")
            } catch (error) {
                console.error(error);
                setErrorMessage(error.message)
                handleNotification("Error", error.message)

            }


        }
    };


    const metadata = {
        contentType: 'image/jpeg'
    };



    const handleAddImage = (e) => {

        const file = e.target.files[0];
        setNewImagesNormal(e.target.files[0])
        const fileName = file.name;
        setImageName(file.name)
        // setNewImages(e.target.files[0])
        console.log(file);
        setNewImages([...newImages, file]);
        // console.log(file);
        // const newImageUrl = URL.createObjectURL(file);
        // setNewImages([...newImages, newImageUrl]);
        // // ... Additional logic for uploading the image to Firebase storage'
        // console.log(newImages);
    };

    useEffect(() => {
        console.log(products);
        if (products !== undefined && products.length != 0) {
            console.log("1");
            setProductID(products[selectedIndex].productID)
            setTitle(products[selectedIndex].title)
            setDescription(products[selectedIndex].desc)
            setCategory(products[selectedIndex].category)
            setMRP(products[selectedIndex].MRP)
            setPrice(products[selectedIndex].price)
        }

    }, [products])

    useEffect(() => {
        if (products !== undefined && products.length != 0) {
            setProductID(products[selectedIndex].productID)
            setTitle(products[selectedIndex].title)
            setDescription(products[selectedIndex].desc)
            setCategory(products[selectedIndex].category)
            setMRP(products[selectedIndex].MRP)
            setPrice(products[selectedIndex].price)
        }

    }, [selectedIndex])
    useEffect(() => {
        console.log("new image", newImages);
    }, [newImages])

    //update firebase image link in db

    const updateProductImage = async (link, type) => {

        console.log(link);
        console.log(products[selectedIndex]._id);

        try {
            const res = await publicRequest.put(`/products/${products[selectedIndex]._id}/update-image/${type}`, {
                link,
            }, {
                withCredentials: true
            });

            console.log(res.data)
        } catch (error) {
            console.error(error);

        }
    };
    //Deleteimage from newImage array since it's updated
    const handleDeleteNewImage = (index) => {
        const updatedImages = { ...newImages }; // Create a copy of the newImages object
        delete updatedImages[index]; // Delete the element at the specified index

        setNewImages(updatedImages); // Update the state with the modified object
    };

    console.log("New Image", newImages);

    const handleUploadImage = async (index) => {
        console.log("upload Starts", newImages);
        console.log("Image name", newImages[index].name);

        //UPLOAD IMAGE ACTUAL
        const storageRef = ref(storage, `Product-Images/Normal/${productID}/${imageName}`);
        const uploadTask = uploadBytesResumable(storageRef, newImages[index], metadata);

        uploadTask.on('state_changed',
            (snapshot) => {
                console.log("size is", snapshot.totalBytes);
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const uploadStatus = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + uploadStatus + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
                setProgress(uploadStatus => uploadStatus + 0);
                setProgress(uploadStatus);


            },
            (error) => {
                // A full list of error codes is available at

                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    // ...

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            () => {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {

                    console.log('File available at', downloadURL);
                    updateProductImage(downloadURL, "Normal").then(() => {
                        console.log("dowld url", downloadURL);
                        console.log(newImages)
                        // handleDeleteNewImage(index)
                        products[selectedIndex].image.push({ src: downloadURL })
                        getProducts()
                        // setNewImages([])

                    })
                    console.log("123");

                });
            }
        );

        //UPLOAD IMAGE SMALL
        const storageRefSmall = ref(storage, `Product-Images/LowQuality/${productID}/${imageName}`);
        const uploadTaskSmall = uploadBytesResumable(storageRefSmall, newImagesSmall, metadata);

        uploadTaskSmall.on('state_changed',
            (snapshot) => {
                console.log("size is", snapshot.totalBytes);
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const uploadStatus = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + uploadStatus + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
                setProgress(uploadStatus => uploadStatus + 0);
                setProgress(uploadStatus);
            },
            (error) => {
                // A full list of error codes is available at

                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    // ...

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            () => {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTaskSmall.snapshot.ref).then((downloadURL) => {

                    console.log('File available at', downloadURL);

                    updateProductImage(downloadURL, "Small").then(() => {
                        console.log("dowld url", downloadURL);
                        console.log(newImages)
                        // handleDeleteNewImage(index)


                    })
                    console.log("123");

                });
            }
        );
        //UPLOAD IMAGE THUMBNAIL
        const storageRefThumbnail = ref(storage, `Product-Images/Thumbnail/${productID}/${imageName}`);
        const uploadTaskThumbnail = uploadBytesResumable(storageRefThumbnail, newImagesThumbnail, metadata);

        uploadTaskThumbnail.on('state_changed',
            (snapshot) => {
                console.log("size is", snapshot.totalBytes);
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const uploadStatus = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + uploadStatus + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
                setProgress(uploadStatus => uploadStatus + 0);
                setProgress(uploadStatus);
            },
            (error) => {
                // A full list of error codes is available at

                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    // ...

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            () => {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTaskThumbnail.snapshot.ref).then((downloadURL) => {

                    console.log('File available at', downloadURL);

                    updateProductImage(downloadURL, "Thumbnail").then(() => {
                        console.log("dowld url", downloadURL);
                        console.log(newImages)
                        // handleDeleteNewImage(index)

                        setNewImages([]);
                    })
                    console.log("123");

                });
            }
        );
    }
    const handleDeleteProduct = async () => {

        try {
            const res = await publicRequest.delete(`/products/${products[selectedIndex]._id}`, {
                withCredentials: true
            })
            console.log(res.data);
            setSelectedIndex(prevIndex => prevIndex - 1)
            setSuccessMessage("Deleted")
            handleNotification("Success", "Product Deleted")
            getProducts()
        } catch (error) {
            console.log(error, error.message)
            handleNotification("Error", error.message)
        }
    }




    return (
        <div className='productsPage'>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Sidebar />
            <div className="singleProductContainer">
                <Navbar />

                <div className="top">
                    <div className="left">
                        <div className="button">
                            <button className='btn' onClick={() => {
                                setAddNewProduct(true)
                                setCategory('')
                                setTitle('')
                                setDescription('')
                                setMRP(0)
                                setPrice(0)
                                setProductID('')
                                setNewImages([]);

                            }}>Add New</button>
                        </div>
                        <div className="products">

                            <TableContainer component={Paper} className="table">
                                <Table sx={{ minWidth: 450 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className="tableCell">Product ID</TableCell>
                                            <TableCell className="tableCell">Price</TableCell>
                                            <TableCell className="tableCell">MRP</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {products ? products.map((product, index) => (
                                            <TableRow key={index} onClick={() => {
                                                console.log("product is", products)
                                                if (addNewProduct) {
                                                    setNewImages([]);
                                                    setAddNewProduct(false)


                                                }
                                                setSelectedProduct(product)
                                                setSelectedIndex(index)
                                                setNewImages([]);

                                            }} >
                                                <TableCell className="tableCell">
                                                    <div className="cellWrapper">
                                                        <img src={product.image ? product.image[0]?.src : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"} alt="" className="image" />
                                                        {product.title}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="tableCell">{product.MRP}</TableCell>
                                                <TableCell className="tableCell">{product.price}</TableCell>
                                            </TableRow>
                                        )) : ''}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </div>

                    {products && <div className="right">
                        <div className="deleteButton" onClick={() => {
                            handleDeleteProduct()
                        }}>
                            Delete
                        </div>
                        <div className="images">

                            <div className="grid">
                                {products && !addNewProduct && products[selectedIndex].image.map((image, index) => {
                                    return <>
                                        <img
                                            src={image.src ? image.src : 'https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg'}

                                            alt="productImage"
                                            className={selectedImg === index ? "selected" : ""}
                                            onClick={(e) => {
                                                if (selectedImg !== index) {

                                                    setSelectedImg(index)
                                                    setImageLoading(true)
                                                }
                                            }
                                            }
                                        />
                                    </>
                                })}
                                {newImages && newImages.map((image, index) => (
                                    <div className="upload-image" key={index}>
                                        <img src={image} alt={newImages.alt} />
                                        <div className="upload-overlay">
                                            <CloudUploadIcon className='upload-btn' onClick={() => handleUploadImage(index)} />
                                            {/* <button className="upload-button" onClick={() => handleImageUpload(image)}>Upload</button> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mainImage">
                                {imageLoading &&

                                    <Bars

                                        heigth="30"
                                        width="30"
                                        color='#0b2b66'
                                        ariaLabel='loading' className='loaderbox' />
                                }
                                <img
                                    style={{ display: imageLoading ? 'none' : 'block' }}
                                    src={addNewProduct || !products[selectedIndex].image[selectedImg]?.src ? 'https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg' : products[selectedIndex].image[selectedImg]?.src}
                                    alt="mainImage"
                                    onLoad={() => setImageLoading(false)}
                                />
                            </div>
                            <div className="action">
                                <label htmlFor="file" >
                                    <DriveFolderUploadIcon className='icon' style={newImages.length > 0 ? { display: "none" } : { display: "unset" }} />
                                </label>
                                <input type="file" id="file" onChange={handleAddImage} style={{ display: "none" }} />
                                <DeleteIcon className='icon' onClick={handleDeleteImage} />

                            </div>
                        </div>
                        <hr />


                        <div className="details">

                            <div className="form">
                                <div className="formInput">

                                    <label>Product ID</label>
                                    <input type="text" value={productID} disabled={!addNewProduct}
                                        onChange={(e) => setProductID(e.target.value)} />
                                </div>
                                <div className="formInput">

                                    <label>Title</label>
                                    <input type="text" value={title}
                                        onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div className="formInput">

                                    <label>Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="formInput">

                                    <label>Category</label>
                                    <input type="text" value={category}
                                        onChange={(e) => setCategory(e.target.value)} />
                                </div>
                                <div className="formInput">

                                    <label>MRP</label>
                                    <input type="text" value={MRP}
                                        onChange={(e) => setMRP(e.target.value)} />
                                </div>
                                <div className="formInput">

                                    <label>Price</label>
                                    <input type="text" value={price}
                                        onChange={(e) => setPrice(e.target.value)} />
                                </div>
                                {addNewProduct ? <button
                                    onClick={() =>
                                        handleNewProduct()}
                                >Add</button> : <button onClick={() =>
                                    handleUpdate(products[selectedIndex]._id)}
                                >Update</button>}
                            </div>
                        </div>

                    </div>
                    }
                </div>

            </div>
        </div>
    )
}

export default Products