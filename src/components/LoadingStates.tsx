'use client';

import { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', color = 'primary', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    emerald: 'border-emerald-500 border-t-transparent',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}
          rounded-full animate-spin
        `}
      />
      {text && (
        <span className="text-sm text-white/60 animate-pulse">{text}</span>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-24 h-3 rounded" />
        </div>
      </div>
      <Skeleton className="w-full h-20 rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="w-20 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 px-4">
        <Skeleton className="w-1/4 h-4" />
        <Skeleton className="w-1/4 h-4" />
        <Skeleton className="w-1/4 h-4" />
        <Skeleton className="w-1/4 h-4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex gap-4 px-4 py-3 bg-white/5 rounded-xl">
          <Skeleton className="w-1/4 h-4" />
          <Skeleton className="w-1/4 h-4" />
          <Skeleton className="w-1/4 h-4" />
          <Skeleton className="w-1/4 h-4" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function ClaimsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="w-48 h-10 rounded-xl" />
        <Skeleton className="w-48 h-10 rounded-xl" />
        <Skeleton className="w-48 h-10 rounded-xl" />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </div>
      
      {/* Table */}
      <TableSkeleton rows={6} />
    </div>
  );
}

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" text={message} />
      </div>
    </div>
  );
}

interface ButtonLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ButtonLoader({ text = 'Loading...', size = 'md' }: ButtonLoaderProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <span className={`inline-flex items-center gap-2 ${sizeClasses[size]}`}>
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      {text}
    </span>
  );
}

interface ProgressLoaderProps {
  progress: number;
  label?: string;
}

export function ProgressLoader({ progress, label }: ProgressLoaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">{label || 'Loading...'}</span>
        <span className="text-primary font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
