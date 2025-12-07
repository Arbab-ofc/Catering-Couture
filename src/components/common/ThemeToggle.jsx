import { LuMoon, LuSun } from 'react-icons/lu'
import { useTheme } from '../../context/ThemeContext'
import PrimaryButton from './PrimaryButton'

const ThemeToggle = ({ variant = 'ghost', className = '' }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <PrimaryButton
      type="button"
      variant={variant}
      className={className}
      onClick={toggleTheme}
      icon={
        theme === 'dark' ? (
          <LuSun className="text-accent" size={18} />
        ) : (
          <LuMoon className="text-accent" size={18} />
        )
      }
    >
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </PrimaryButton>
  )
}

export default ThemeToggle
