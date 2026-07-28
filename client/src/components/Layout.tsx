import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import {
    LayoutDashboard,
    Receipt,
    Upload,
    LogOut,
    Wallet,
    User,
} from 'lucide-react'

interface NavItem {
    to: string
    icon: React.ElementType
    label: string
}

const navItems: NavItem[] = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload Receipt' },
    { to: '/receipts', icon: Receipt, label: 'All Receipts' }
]

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }


    return (
        <div className="min-h-screen bg-gray-50 flex">

            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Wallet size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 text-lg leading-none">
                                TaxMate Easy
                            </h1>
                            <p className="text-xs text-gray-400">
                                We make tax filing easy
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                 font-medium transition-colors ${isActive
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={18}
                                        className={isActive ? 'text-green-600' : 'text-gray-400'}
                                    />
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center
                            justify-center flex-shrink-0">
                            <span className="text-green-700 font-semibold text-sm">
                                <User size={16} />
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.full_name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                       text-sm text-gray-500 hover:text-red-600
                       hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={15} />
                        Sign out
                    </button>
                </div>

            </aside>

            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>

        </div>
    )
}