# MehmetHairDesigner.Client

Frontend of the MehmetHairDesigner admin platform — a comprehensive management dashboard built with React + TypeScript for barbershop appointment, finance, and user tracking. This project is designed for internal admin usage.

---

## 🌐 Tech Stack

- **React + TypeScript**
- **TailwindCSS** for styling
- **Axios** for API communication
- **Modular Component Architecture**
- **Custom Hooks**
- **Yandex Maps API** on Contact page

---

## 📁 Folder Structure Overview

```
src/
├── pages/
│   ├── admindashboard/
│   │   ├── appointments/         # Calendar-based appointment views
│   │   ├── barbers/              # Manage barber profiles
│   │   ├── Expenses/             # Expense management pages
│   │   ├── finance/              # Financial summaries
│   │   ├── statistics/           # Statistics dashboards & charts
│   │   ├── users/                # User management interface
│   │   └── index.tsx            # Root dashboard landing page
│   ├── Dashboard.tsx            # Static public landing (hero/services)
│   ├── Appointment.tsx          # User calendar for appointment booking
│   ├── Auth.tsx                 # Flip card style Login/Register
│   └── Contact.tsx              # Static contact with Yandex maps
│
├── components/
│   ├── CalendarView.tsx         # Calendar layout for appointment times
│   ├── ConfirmModal.tsx         # Reusable confirmation modal
│   ├── LoginModal.tsx           # Prompt modal for login-required actions
│   ├── Header / Sidebar / Navbar
│
├── services/
│   ├── authService.ts           # Login, register, logout
│   ├── appointmentService.ts    # Fetch/create/cancel appointments
│   ├── adminService.ts          # Admin-only actions
│   ├── barberService.ts         # CRUD for barbers
│   ├── statsService.ts          # Fetch charts/statistics
│   └── userService.ts           # Fetch user details & roles
│
├── Hooks/
│   ├── useCalendarRefresh.tsx   # Custom hook for calendar data re-fetching
│   └── useWindowSize.tsx        # Responsive adjustments
```

---

## 🧪 Features

- 📅 **Calendar View** for selecting time slots (Admin & Client)
- 👤 **User Authentication**: login, register, and modal login prompts
- 🧾 **Expense & Finance Management**
- 📊 **Business Insights** via statistics pages
- 🧑‍🔧 **Barber CRUD**: add/remove/edit barbers
- 🗃 **Modular components** and reusable hooks
- 🌐 **Contact page** with Yandex map integration

---

## 🔌 API Services

All backend requests are handled via `services/*.ts` using `axiosInstance.ts`.

Example: `authService.ts`
```ts
export const login = async (credentials) => {
  return axiosInstance.post("/auth/login", credentials);
};
```

Example: `appointmentService.ts`
```ts
export const getAvailableSlots = (barberId, date) =>
  axiosInstance.get(`/appointment/available-slots`, { params: { barberId, date } });
```

---

## 📦 Installation & Setup

```bash
npm install
npm run dev
```

Make sure your backend API is running and accessible (typically `http://localhost:5000` or a `.env` variable).

---

## ✅ TODO

- Add dark mode
- Improve mobile responsiveness
- Admin multi-calendar drag feature
- Auto-refresh appointment tiles

---

## 📸 Screenshots

> UI includes modern modals, flip card auth, calendar views, role-based pages, and intuitive dashboard layout.

---

## 📄 License

MIT — feel free to use and modify with attribution.
