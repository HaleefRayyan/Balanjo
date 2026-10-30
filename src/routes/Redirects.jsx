import { Navigate, useParams } from "react-router-dom"

// Alamat lama (sebelum Profil & Seller Centre jadi panel sendiri) tetap berfungsi
export const RedirectBlogEdit = () => <Navigate to={`/profile/blogs/${useParams().slug}/edit`} replace />
export const RedirectForumEdit = () => <Navigate to={`/profile/forums/${useParams().id}/edit`} replace />
