import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { adminService } from '../services/adminService';
import type { AdminUser } from '../types';

interface AuthContextType {
    user: AdminUser | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check initial session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    username: session.user.email?.split('@')[0] || 'Admin',
                    role: (session.user.user_metadata?.role as any) || 'super_admin',
                    status: 'active',
                    createdAt: session.user.created_at,
                    lastLogin: new Date().toISOString(),
                });
            }
            setLoading(false);
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    username: session.user.email?.split('@')[0] || 'Admin',
                    role: (session.user.user_metadata?.role as any) || 'super_admin',
                    status: 'active',
                    createdAt: session.user.created_at,
                    lastLogin: new Date().toISOString(),
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: pass,
            });

            if (error) {
                // Record failed attempt
                await adminService.recordLoginLog({
                    userId: '',
                    username: email,
                    ip: 'Client Side',
                    status: 'failed',
                });
                throw error;
            }

            if (data?.user) {
                // Record success log
                await adminService.recordLoginLog({
                    userId: data.user.id,
                    username: data.user.email?.split('@')[0] || 'Admin',
                    ip: 'Client Side',
                    status: 'success',
                });
            }
        } catch (err) {
            throw err;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
