import { useContext } from "react";
import { useSelector } from "react-redux";
import { cn } from "@/utils/cn";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import { AuthContext } from "../../App";

const UserProfile = () => {
  const { logout } = useContext(AuthContext);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  if (!isAuthenticated || !user) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
        <ApperIcon name="User" className="w-4 h-4 text-white" />
      </div>
    );
  }
  
  const getInitials = () => {
    const firstName = user.firstName || user.name?.split(' ')[0] || 'U';
    const lastName = user.lastName || user.name?.split(' ')[1] || 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  return (
    <div className="relative group">
      <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center cursor-pointer">
        <span className="text-white text-sm font-medium">{getInitials()}</span>
      </div>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">
            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'User'}
          </p>
          <p className="text-xs text-gray-500">{user.email || user.emailAddress}</p>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};
const Header = ({ 
  title = "Dashboard",
  subtitle,
  showSearch = false,
  onSearch,
  searchPlaceholder = "Search patients...",
  actions,
  className,
  ...props 
}) => {
  return (
    <header className={cn("bg-white border-b border-gray-200 shadow-sm", className)} {...props}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="w-80">
                <SearchBar 
                  placeholder={searchPlaceholder}
                  onSearch={onSearch}
                />
              </div>
            )}
            
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
            
<div className="flex items-center space-x-3">
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                onClick={() => {
                  toast.info('No new notifications');
                }}
              >
                <ApperIcon name="Bell" className="w-5 h-5 text-gray-600" />
              </button>
              
              <UserProfile />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;