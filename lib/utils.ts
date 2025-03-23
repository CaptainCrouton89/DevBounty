import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function truncate(str: string, length: number): string {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    const years = Math.floor(interval);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }
  const secs = Math.floor(seconds);
  return `${secs} second${secs !== 1 ? "s" : ""} ago`;
};
