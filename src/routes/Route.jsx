import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import Blog from "../pages/Blog";
import DetailBlog from "../pages/DetailBlog";
import DetailCategory from "../pages/DetailCategory";
import DetailProduct from "../pages/DetailProduct";
import SellerStore from "../pages/SellerStore";
import ECommerce from "../pages/ECommerce";
import Forum from "../pages/Forum";
import GetStarted from "../pages/GetStarted";
import Home from "../pages/Home";
import UploadArtikel from "../pages/UploadArtikel";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import Cart from "../pages/Cart";
import SellerLayout from "../layouts/SellerLayout";
import SellerDashboard from "../pages/Seller/SellerDashboard";
import SellerProducts from "../pages/Seller/SellerProducts";
import SellerOrders from "../pages/Seller/SellerOrders";
import SellerBanners from "../pages/Seller/SellerBanners";
import SellerEarnings from "../pages/Seller/SellerEarnings";
import SellerProductForm from "../pages/SellerProductForm";
import ProfileLayout from "../layouts/ProfileLayout";
import ProfileAccount from "../pages/Profile/ProfileAccount";
import ProfileOrders from "../pages/Profile/ProfileOrders";
import MyBlogs from "../pages/Profile/MyBlogs";
import MyPosts from "../pages/Profile/MyPosts";
import ProfileEditBlog from "../pages/Profile/ProfileEditBlog";
import ProfileEditPost from "../pages/Profile/ProfileEditPost";
import { RedirectBlogEdit, RedirectForumEdit } from "./Redirects";
import { Navigate } from "react-router-dom";
import ForumDetail from "../pages/ForumDetail";
import NewDiscussion from "../pages/NewDiscussion";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Blogs from "../pages/admin/Blogs";
import Forums from "../pages/admin/Forums";
import Banners from "../pages/admin/Banners";
import BannerRequests from "../pages/admin/BannerRequests";
import ChangePassword from "../pages/admin/ChangePassword";
import Payouts from "../pages/admin/Payouts";
import AdminOrders from "../pages/admin/Orders";
import Refunds from "../pages/admin/Refunds";
import AdminReviews from "../pages/admin/Reviews";

const routes = [
    {
        element: <MainLayout />,
        children: [
            { index: true, element: <Home />, handle: { navOverlay: true } },
            { path: "get-started", element: <GetStarted /> },
            {
                path: "forum",
                children: [
                    { index: true, element: <Forum /> },
                    {
                        element: <ProtectedRoute />,
                        children: [
                            { path: "new", element: <NewDiscussion /> },
                            { path: ":id/edit", element: <RedirectForumEdit /> },
                        ],
                    },
                    { path: ":id", element: <ForumDetail /> },
                ],
            },
            {
                path: "blog",
                children: [
                    { index: true, element: <Blog /> },
                    {
                        element: <ProtectedRoute />,
                        children: [
                            { path: "new", element: <UploadArtikel /> },
                            { path: ":slug/edit", element: <RedirectBlogEdit /> },
                        ],
                    },
                    { path: ":slug", element: <DetailBlog /> },
                ],
            },
            {
                path: "e-commerce",
                children: [
                    { index: true, element: <ECommerce /> },
                    { path: "category/:category", element: <DetailCategory /> },
                    { path: "product/:id", element: <DetailProduct /> },
                    { path: "seller/:id", element: <SellerStore /> },
                ],
            },
            { path: "cart", element: <Cart /> },
            { path: "orders", element: <Navigate to="/profile/orders" replace /> },
            { path: "*", element: <NotFound /> },
        ],
    },
    // Seller Centre & Profil: panel sendiri (sidebar + topbar), di luar navbar/footer situs
    {
        path: "/seller",
        element: <ProtectedRoute />,
        children: [
            {
                element: <SellerLayout />,
                children: [
                    { index: true, element: <SellerDashboard /> },
                    { path: "products", element: <SellerProducts /> },
                    { path: "products/new", element: <SellerProductForm /> },
                    { path: "products/:id/edit", element: <SellerProductForm /> },
                    { path: "orders", element: <SellerOrders /> },
                    { path: "earnings", element: <SellerEarnings /> },
                    { path: "banners", element: <SellerBanners /> },
                ],
            },
        ],
    },
    {
        path: "/profile",
        element: <ProtectedRoute />,
        children: [
            {
                element: <ProfileLayout />,
                children: [
                    { index: true, element: <ProfileAccount /> },
                    { path: "orders", element: <ProfileOrders /> },
                    { path: "blogs", element: <MyBlogs /> },
                    { path: "blogs/:slug/edit", element: <ProfileEditBlog /> },
                    { path: "forums", element: <MyPosts /> },
                    { path: "forums/:id/edit", element: <ProfileEditPost /> },
                ],
            },
        ],
    },
    {
        path: "/admin",
        element: <ProtectedRoute role="admin" />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: "users", element: <Users /> },
                    { path: "blogs", element: <Blogs /> },
                    { path: "forums", element: <Forums /> },
                    { path: "e-commerce", element: <Banners /> },
                    { path: "e-commerce/requests", element: <BannerRequests /> },
                    { path: "e-commerce/reviews", element: <AdminReviews /> },
                    { path: "orders", element: <AdminOrders /> },
                    { path: "orders/refunds", element: <Refunds /> },
                    { path: "payouts", element: <Payouts /> },
                    { path: "password", element: <ChangePassword /> },
                ],
            },
        ],
    },
    {
        element: <AuthLayout />,
        children: [
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
            { path: "/forgot-password", element: <ForgotPassword /> },
            { path: "/reset-password", element: <ResetPassword /> },
        ],
    },
]

export default routes
