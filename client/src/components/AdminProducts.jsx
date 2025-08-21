import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../services/api";
import ImageUpload from "./ImageUpload";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PackageIcon,
  ImageIcon,
  PencilSimpleIcon,
  TrashIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editProduct, setEditProduct] = useState({
    name: "",
    description: "",
    basePrice: "",
    category: "",
    available: true,
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    basePrice: "",
    category: "",
    available: true,
  });

  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: adminAPI.getProducts,
  });

  const createProductMutation = useMutation({
    mutationFn: adminAPI.createProduct,
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries(["adminProducts"]);
      setShowAddForm(false);
      setNewProduct({
        name: "",
        description: "",
        basePrice: "",
        category: "",
        available: true,
      });
    },
    onError: (error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries(["adminProducts"]);
      setShowEditForm(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: adminAPI.deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries(["adminProducts"]);
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  const AllProducts = products?.data?.data || [];

  const filteredProducts = AllProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (e) => {
    e.preventDefault();
    createProductMutation.mutate({
      ...newProduct,
      basePrice: parseFloat(newProduct.basePrice),
    });
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditProduct({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString(),
      category: product.category,
      available: product.available || true, // Handle both field names
    });
    setShowEditForm(true);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    const updateData = {
      name: editProduct.name,
      description: editProduct.description,
      price: `From ₦${parseFloat(editProduct.basePrice).toLocaleString()}`,
      basePrice: parseFloat(editProduct.basePrice),
      category: editProduct.category,
      available: editProduct.available || true,
    };

    updateProductMutation.mutate({
      id: selectedProduct._id,
      data: updateData,
    });
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete._id);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const categories = ["Traditional", "Formal", "Casual"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading products: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Products</h1>
          <p className="text-base-content/60 mt-2">
            Manage your product catalog ({AllProducts.length || 0} products)
          </p>
        </div>

        <div className="form-control w-full max-w-md">
          <div className="input-group flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {AllProducts.length > 0 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
        )}
      </div>

      {/* Search */}

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Product Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Base Price (₦)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={newProduct.basePrice}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        basePrice: e.target.value,
                      })
                    }
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={newProduct.isActive}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        isActive: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditForm && selectedProduct && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              Edit Product - {selectedProduct.name}
            </h3>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Product Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={editProduct.category}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        category: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Base Price (₦)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={editProduct.basePrice}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        basePrice: e.target.value,
                      })
                    }
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={editProduct.available}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        isActive: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={editProduct.description}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Update Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Manager Modal */}
      {showImageManager && selectedProduct && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">
                Manage Images - {selectedProduct.name}
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setShowImageManager(false);
                  setSelectedProduct(null);
                }}
              >
                ✕
              </button>
            </div>

            <ImageUpload
              productId={selectedProduct._id}
              existingImages={selectedProduct.images || []}
              onImagesUpdate={() => {
                queryClient.invalidateQueries(["adminProducts"]);
              }}
            />

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowImageManager(false);
                  setSelectedProduct(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error mb-4">
              Delete Product
            </h3>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{productToDelete.name}"</span>?
            </p>
            <p className="text-sm text-base-content/70 mb-6">
              This action cannot be undone. All associated images and data will
              be permanently removed.
            </p>

            <div className="modal-action">
              <button
                className="btn"
                onClick={cancelDelete}
                disabled={deleteProductMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={confirmDelete}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
        {filteredProducts?.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="card bg-base-100  max-h-[77vh] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-base-200 overflow-hidden group"
            >
              <figure className="relative aspect-square bg-gradient-to-br from-base-200 to-base-300 overflow-hidden">
                {product.images?.length > 0 ? (
                  <>
                    <img
                      src={
                        product.images.find((img) => img.isMain)?.url ||
                        product.images[0]?.url
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-base-200 to-base-300">
                    <ImageIcon className="h-20 w-20 text-base-content/30" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`badge ${
                      product.isActive || product.available
                        ? "badge-success"
                        : "badge-error"
                    } badge-sm font-medium shadow-lg`}
                  >
                    {product.isActive || product.available
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* Image Count Badge */}
                {product.images?.length > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="badge badge-neutral badge-sm opacity-80">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      {product.images.length}
                    </div>
                  </div>
                )}
              </figure>

              <div className="card-body p-5">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="card-title text-lg font-bold text-base-content line-clamp-2 flex-1">
                    {product.name}
                  </h2>
                </div>

                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge badge-outline badge-sm font-medium">
                    {product.category}
                  </span>
                  <div className="text-2xl font-bold text-primary">
                    ₦{product.basePrice?.toLocaleString()}
                  </div>
                </div>

                <p className="text-sm text-base-content/70 line-clamp-3 mb-4 leading-relaxed">
                  {product.description}
                </p>

                {/* Action Buttons */}
                <div className="card-actions justify-center pt-2 border-t border-base-200">
                  <div className="flex space-x-8">
                    <div className="tooltip" data-tip="Manage Images">
                      <button
                        className="btn btn-ghost btn-sm hover:btn-primary transition-colors duration-200"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowImageManager(true);
                        }}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="tooltip" data-tip="Edit Product">
                      <button
                        className="btn btn-ghost btn-sm hover:btn-info transition-colors duration-200"
                        onClick={() => handleEditProduct(product)}
                      >
                        <PencilSimpleIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="tooltip" data-tip="Delete Product">
                      <button
                        className="btn btn-ghost btn-sm hover:btn-error transition-colors duration-200"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <PackageIcon className="h-16 w-16 mx-auto text-base-content/40 mb-4" />
            <p className="text-base-content/60">
              {searchTerm
                ? "No products found matching your search"
                : "No products found"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Stats */}
      {AllProducts?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-title">Total Products</div>
            <div className="stat-value text-primary">
              {AllProducts?.length || 0}
            </div>
          </div>
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-title">Available Products</div>
            <div className="stat-value text-success">
              {AllProducts.filter((product) => product.isActive).length || 0}
            </div>
          </div>
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-title">Unavailable Products</div>
            <div className="stat-value text-error">
              {AllProducts.filter((product) => !product.isActive).length || 0}
            </div>
          </div>
          <div className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-title">Categories</div>
            <div className="stat-value text-info">
              {new Set(AllProducts.map((product) => product.category)).size ||
                0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
