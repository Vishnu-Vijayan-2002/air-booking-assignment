import React from 'react';
import { Plane, ShieldCheck, Mail, Globe, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              AirBooking Platform
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Full Stack Enterprise Flight Booking & Real-Time Management Platform built for 
              <strong className="text-white"> YUAI Soft Solutions Pvt. Ltd.</strong> Featuring custom
              administrator approval workflows, JWT authentication, and OpenSky Network real-time tracking feeds.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                API Cluster Online
              </span>
              <span>&bull;</span>
              <span>Django REST Framework + React</span>
              <span>&bull;</span>
              <span>Celery Email Pipeline</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/flights" className="hover:text-sky-400 transition-colors">Flight Search & Booking</a></li>
              <li><a href="/live-radar" className="hover:text-sky-400 transition-colors">Live Radar Telemetry</a></li>
              <li><a href="/my-trips" className="hover:text-sky-400 transition-colors">Boarding Passes & Trips</a></li>
              <li><a href="/admin" className="hover:text-sky-400 transition-colors">Admin Approval Console</a></li>
            </ul>
          </div>

          {/* Submission Info */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Take-Home Submission</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <a href="mailto:yuaisoftsolutions@gmail.com" className="hover:text-white">
                  yuaisoftsolutions@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Approval Verification</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>AirLabs / OpenSky Telemetry</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} AirBooking. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with precision for <span className="text-slate-300 font-medium">YUAI Soft Solutions</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
