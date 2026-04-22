import path from "path";

export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
{
		path: '/home',
		name: 'Trang chủ',
		icon: 'HomeOutlined',
		component: './Home',
	},
	{
		path: '/post/:id',
		name: 'Chi tiết bài viết',
		component: './PostDetail',
		hideInMenu: true,
	},
	{
		path: '/about',
		name: 'Giới thiệu',
		icon: 'UserOutlined',
		component: './About',
	},
	{
		path: '/admin',
		name: 'Quản lý',
		icon: 'AppstoreOutlined',
		routes: [
			{
				path: '/admin/posts',
				name: 'Quản lý bài viết',
				component: './Admin/PostManagement',
			},
			{
				path: '/admin/tags',
				name: 'Quản lý thẻ',
				component: './Admin/TagManagement',
			},
		],
	},
	
	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
