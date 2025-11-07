import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-bold text-lg">{APP_NAME}</h3>
            <p className="text-sm text-muted-foreground">
              Modern web-based robo advisory platform for comprehensive financial planning
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Planning</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/retirement" className="hover:text-primary">Retirement Planning</Link></li>
              <li><Link href="/goals" className="hover:text-primary">Goal Planning</Link></li>
              <li><Link href="/portfolio" className="hover:text-primary">Portfolio Analysis</Link></li>
              <li><Link href="/coast-fire" className="hover:text-primary">Coast FIRE</Link></li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/guides" className="hover:text-primary">Video Guides</Link></li>
              <li><Link href="/help" className="hover:text-primary">Help Center</Link></li>
              <li><Link href="/calculators" className="hover:text-primary">Calculators</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
