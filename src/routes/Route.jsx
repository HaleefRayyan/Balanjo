import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import Blog from "../pages/Blog";
import DetailBlog from "../pages/DetailBlog";
import DetailCategory from "../pages/DetailCategory";
import DetailProduct from "../pages/DetailProduct";
import ECommerce from "../pages/ECommerce";
import Forum from "../pages/Forum";
import GetStarted from "../pages/GetStarted";
import Home from "../pages/Home";
import UploadArtikel from "../pages/UploadArtikel";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";
import Profile from "../pages/Profile";
import EditArtikel from "../pages/EditArtikel";
import EditDiscussion from "../pages/EditDiscussion";
import Seller from "../pages/Seller";
import SellerProductForm from "../pages/SellerProductForm";
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
                            { path: ":id/edit", element: <EditDiscussion /> },
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
                            { path: ":slug/edit", element: <EditArtikel /> },
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
                ],
            },
            { path: "cart", element: <Cart /> },
            {
                element: <ProtectedRoute />,
                children: [
                    { path: "orders", element: <Orders /> },
                    { path: "profile", element: <Profile /> },
                    { path: "seller", element: <Seller /> },
                    { path: "seller/products/new", element: <SellerProductForm /> },
                    { path: "seller/products/:id/edit", element: <SellerProductForm /> },
                ],
            },
            { path: "*", element: <NotFound /> },
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
