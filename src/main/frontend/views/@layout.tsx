import { createMenuItems, useViewConfig } from '@vaadin/hilla-file-router/runtime.js';
import { effect, signal } from '@vaadin/hilla-react-signals';
import {
    AppLayout,
    Avatar,
    Button,
    DrawerToggle,
    Icon,
    SideNav,
    SideNavItem,
} from '@vaadin/react-components';
import { useAuth } from 'Frontend/util/auth.js';
import { Suspense, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';

const documentTitleSignal = signal('');
effect(() => {
    document.title = documentTitleSignal.value;
});

(window as any).Vaadin.documentTitleSignal = documentTitleSignal;

export default function MainLayout() {
    const currentTitle = useViewConfig()?.title;
    const viewConfig = useViewConfig();
    const hideMenu = viewConfig?.menu?.exclude === true;

    const navigate = useNavigate();
    const location = useLocation();
    const { state, logout } = useAuth();

    useEffect(() => {
        if (currentTitle) {
            documentTitleSignal.value = currentTitle;
        }
    }, [currentTitle]);

    const profilePictureUrl = "";

    const hasAuthority = (key: string): boolean => {
        return (
            state?.user?.authorities?.some(
                (a: any) =>
                    a.authority === `ROLE_${key}` ||
                    a.authority.toLowerCase() === `role_${key.toLowerCase()}`
            ) ?? false
        );
    };

    return (
        <AppLayout primarySection="drawer">
            {!hideMenu && (
                <div slot="drawer" className="flex flex-col justify-between h-full p-4 bg-gray-50 border-r border-gray-200">
                    <header className="flex flex-col gap-4">
                        <span className="font-bold text-xl text-gray-800 px-2">Adudu Ashpalt</span>

                        <SideNav onNavigate={({ path }) => navigate(path!)} location={location} className="w-full">
                            {createMenuItems().map(({ to, title, icon }) => (
                                <SideNavItem path={to} key={to}>
                                    {icon ? <Icon src={icon} slot="prefix" /> : null}
                                    {title}
                                </SideNavItem>
                            ))}

                            {hasAuthority('settingMaster-view') && (
                                <SideNavItem>
                                    <Icon icon="vaadin:cog" slot="prefix" />
                                    Settings
                                    <SideNav slot="children">
                                        <SideNavItem path="/role-management">
                                            <Icon icon="vaadin:users" slot="prefix" />
                                            Role
                                        </SideNavItem>
                                    </SideNav>
                                </SideNavItem>
                            )}
                        </SideNav>
                    </header>

                    <footer className="flex flex-col gap-3 px-2 pb-2">
                        {state.user ? (
                            <>
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-200 shadow-sm">
                                    <Avatar theme="xsmall" img={profilePictureUrl} name={state?.user?.username || "User"} />
                                    <span className="text-sm font-medium text-gray-700 truncate">{state?.user.username || "User"}</span>
                                </div>
                                <Button onClick={async () => await logout()} className="w-full">
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <Link to="/login" className="text-blue-600 hover:underline text-sm font-medium">
                                Sign in
                            </Link>
                        )}
                    </footer>
                </div>
            )}

            {!hideMenu && <DrawerToggle slot="navbar" aria-label="Menu toggle" />}

            <h1 slot="navbar" className="text-lg font-semibold text-gray-800 m-0 px-5">
                {documentTitleSignal}
            </h1>

            <Suspense>
                <Outlet />
            </Suspense>
        </AppLayout>
    );
}
