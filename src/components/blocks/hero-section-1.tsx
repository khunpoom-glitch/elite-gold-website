"use client"

import React from 'react'
import Link from 'next/link'
import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    Bell,
    BookOpenCheck,
    CheckCircle2,
    ChevronDown,
    Clipboard,
    LayoutDashboard,
    LogOut,
    Menu,
    NotebookPen,
    Settings,
    Sparkles,
    X,
} from 'lucide-react'
import type { Variants } from 'framer-motion'
import { logoutAction } from '@/app/auth/actions'
import { Button } from '@/components/blocks/hero-section-1-button'
import { EliteGoldNavbarLogo as Logo } from '@/components/shared/elite-gold-navbar-logo'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { ShinyButton } from '@/components/ui/shiny-button'
import {
    HOME_PATH,
    HOME_SECTION_ROUTES,
    TOP_SECTION_ID,
    type HomeSectionId,
} from '@/config/home-sections'
import {
    AUTH_MODAL_EVENT_NAME,
    AUTH_MODAL_ROUTES,
    type AuthModalEventDetail,
    type AuthModalMode,
} from '@/config/auth-modal'
import type { PublicSessionState } from '@/lib/member/public-session'
import { cn } from '@/lib/utils'

const transitionVariants: { item: Variants } = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

const heroFeatureCards = [
    {
        title: 'Trading Education',
        description: 'Structured learning path',
        icon: BookOpenCheck,
    },
    {
        title: 'Trading Journal',
        description: 'Record and review discipline',
        icon: NotebookPen,
    },
    {
        title: 'Long-Term Growth',
        description: 'Stats-led improvement rhythm',
        icon: BarChart3,
    },
] as const

function shouldUseNativeLink(event: React.MouseEvent<HTMLAnchorElement>) {
    return (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
    )
}

function scrollToSection(sectionId: HomeSectionId) {
    const target = document.getElementById(sectionId)

    if (!target) {
        return
    }

    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth'

    target.scrollIntoView({ behavior, block: 'start' })
}

function navigateToHomeSection(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    sectionId: HomeSectionId,
    onNavigate?: () => void,
) {
    if (shouldUseNativeLink(event)) {
        return
    }

    event.preventDefault()
    onNavigate?.()

    if (window.location.pathname !== href) {
        window.history.pushState(null, '', href)
    }

    scrollToSection(sectionId)
}

function navigateToAuthModal(
    event: React.MouseEvent<HTMLAnchorElement>,
    mode: AuthModalMode,
    onNavigate?: () => void,
) {
    if (shouldUseNativeLink(event)) {
        return
    }

    event.preventDefault()
    onNavigate?.()

    const detail: AuthModalEventDetail = {
        mode,
        returnHref: `${window.location.pathname}${window.location.search}`,
    }

    window.dispatchEvent(new CustomEvent(AUTH_MODAL_EVENT_NAME, { detail }))
}

function getMemberInitials(name: string, email: string) {
    const nameParts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    if (nameParts.length >= 2) {
        return `${nameParts[0]?.[0] ?? ''}${nameParts[1]?.[0] ?? ''}`.toUpperCase()
    }

    const fallback = nameParts[0] ?? email

    return (fallback.slice(0, 2) || 'EG').toUpperCase()
}

type HeroSectionProps = {
    publicSession: PublicSessionState
}

export function HeroSection({ publicSession }: HeroSectionProps) {
    function handleCommunityClick() {
        if (publicSession.isAuthenticated) {
            window.location.assign(publicSession.primaryActionHref)
            return
        }

        const detail: AuthModalEventDetail = {
            mode: 'signup',
            returnHref: `${window.location.pathname}${window.location.search}`,
        }

        window.dispatchEvent(new CustomEvent(AUTH_MODAL_EVENT_NAME, { detail }))
    }

    return (
        <>
            <HeroHeader publicSession={publicSession} />
            <main className="overflow-hidden">
                <section className="border-b border-white/8" id="top">
                    <div className="relative flex min-h-[calc(100svh+4rem)] flex-col justify-center pb-20 pt-28 md:pt-32 lg:min-h-[calc(100svh+5rem)] lg:pb-24 lg:pt-32">
                        <div className="relative z-10 mx-auto w-full max-w-7xl -translate-y-6 px-6 lg:-translate-y-8 2xl:-translate-y-12">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <div
                                        className="mx-auto mt-6 inline-flex max-w-full items-center rounded-full border border-white/10 bg-black/60 px-5 py-2 text-[0.62rem] font-semibold uppercase text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md sm:px-7 sm:py-2.5 sm:text-sm lg:mt-8"
                                        style={{ letterSpacing: 'clamp(0.1em, 0.55vw, 0.22em)' }}>
                                        <span aria-hidden="true" className="mr-3 text-soft-gold">●</span>
                                        <span className="text-nowrap">DISCIPLINE · STRATEGY · CONSISTENCY</span>
                                    </div>
                                    <h1
                                        className="mx-auto mt-7 max-w-5xl text-balance text-5xl font-bold leading-[1.08] tracking-[-0.025em] md:text-7xl xl:text-[5.5rem]">
                                        ELITE GOLD COMMUNITY
                                    </h1>
                                    <p
                                        className="mx-auto mt-7 max-w-[18rem] text-balance text-lg font-light leading-8 text-muted-foreground sm:max-w-3xl sm:text-xl">
                                        Empowering traders with knowledge, discipline, and a supportive community to navigate the markets with confidence and achieve their full potential.

                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
                                    <ShinyButton
                                        key={1}
                                        onClick={handleCommunityClick}
                                        type="button"
                                        className="h-11 min-w-[16.1875rem] cursor-pointer gap-2.5 rounded-lg px-6 py-2 text-sm font-medium text-white/90 hover:shadow-[0_0_20px_rgba(250,250,250,0.10)]"
                                        style={{
                                            '--shiny-button-border': 'rgba(230, 199, 102, 0.7)',
                                            '--shiny-button-border-highlight': 'rgba(255, 248, 215, 0.96)',
                                            '--shiny-button-border-muted': 'rgba(230, 199, 102, 0.12)',
                                            '--shiny-button-foreground': 'rgba(255, 255, 255, 0.9)',
                                            background: '#000000',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            letterSpacing: 0,
                                        } as React.CSSProperties}>
                                        <Sparkles aria-hidden="true" className="size-4 shrink-0 stroke-[1.85]" />
                                        <span className="text-nowrap">Enter Community</span>
                                        <ArrowRight aria-hidden="true" className="size-4 shrink-0 stroke-[1.85]" />
                                    </ShinyButton>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-11 min-w-[10.75rem] cursor-pointer rounded-lg border border-white/10 bg-black px-6 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_34px_rgba(0,0,0,0.36)] hover:border-white/20 hover:bg-white/5 hover:text-white"
                                        style={{
                                            background: '#000000',
                                            border: '1px solid rgba(250, 250, 250, 0.1)',
                                            borderRadius: '0.5rem',
                                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 16px 34px rgba(0, 0, 0, 0.36)',
                                            color: '#ffffff',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            letterSpacing: 0,
                                            minHeight: '2.75rem',
                                            minWidth: '10.75rem',
                                            paddingInline: '1.5rem',
                                        }}>
                                        <Link
                                            href="/education"
                                            onClick={(event) => navigateToHomeSection(event, '/education', 'trading-education')}>
                                            <span className="text-nowrap">Explore Education</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.08,
                                                    delayChildren: 0.95,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mx-auto mt-10 grid w-full max-w-[58rem] gap-3 text-left sm:mt-12 lg:grid-cols-3">
                                    {heroFeatureCards.map((card) => {
                                        const Icon = card.icon

                                        return (
                                            <div
                                                key={card.title}
                                                className="group flex min-h-[4.25rem] items-center gap-3 rounded-md border border-white/10 bg-black/80 p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_48px_rgba(0,0,0,0.28)] transition-colors hover:border-soft-gold/35">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-soft-gold/30 bg-soft-gold/10 text-soft-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                                    <Icon aria-hidden="true" className="h-4 w-4 stroke-[1.8]" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-bold leading-tight tracking-normal text-white">
                                                        {card.title}
                                                    </span>
                                                    <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                                                        {card.description}
                                                    </span>
                                                </span>
                                            </div>
                                        )
                                    })}
                                </AnimatedGroup>
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </>
    )
}

type MemberProfileMenuProps = {
    publicSession: PublicSessionState
    onNavigate: () => void
}

function MemberProfileMenu({ publicSession, onNavigate }: MemberProfileMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'error'>('idle')
    const menuRef = React.useRef<HTMLDivElement>(null)
    const isActive = publicSession.memberStatus === 'Active'
    const memberInitials = getMemberInitials(publicSession.memberName, publicSession.memberEmail)
    const profileHref = publicSession.secondaryActionHref ?? '/dashboard/account'
    const statusActionHref = publicSession.primaryActionHref
    const accessCode = publicSession.memberAccessCode
    const StatusIcon = isActive ? CheckCircle2 : AlertCircle

    React.useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!menuRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        function handleScrollDismiss() {
            setIsOpen(false)
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)
        window.addEventListener('scroll', handleScrollDismiss, { passive: true })
        window.addEventListener('wheel', handleScrollDismiss, { passive: true })
        window.addEventListener('touchmove', handleScrollDismiss, { passive: true })

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('scroll', handleScrollDismiss)
            window.removeEventListener('wheel', handleScrollDismiss)
            window.removeEventListener('touchmove', handleScrollDismiss)
        }
    }, [])

    async function handleCopyAccessLink() {
        if (!accessCode) {
            return
        }

        const signupUrl = new URL('/signup', window.location.origin)
        signupUrl.searchParams.set('accessCode', accessCode)

        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error('Clipboard API is not available')
            }

            await navigator.clipboard.writeText(signupUrl.toString())
            setCopyState('copied')
            window.setTimeout(() => setCopyState('idle'), 1800)
        } catch {
            setCopyState('error')
            window.setTimeout(() => setCopyState('idle'), 1800)
        }
    }

    function handleMenuLinkClick() {
        setIsOpen(false)
        onNavigate()
    }

    return (
        <div ref={menuRef} className="relative flex w-full justify-end sm:w-auto">
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                <span
                    aria-hidden="true"
                    className="hidden size-8 place-items-center rounded-full border border-white/10 bg-white/[0.025] text-white/52 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:grid">
                    <Bell className="size-3.5 stroke-[1.75]" />
                </span>
                <button
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    aria-label="Open member profile menu"
                    className="flex h-9 min-w-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2 text-white transition hover:border-[#E6C766]/28 hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/55"
                    onClick={() => setIsOpen((current) => !current)}
                    type="button">
                    <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border border-[#E6C766]/22 bg-[#101010] text-[0.62rem] font-extrabold text-[#F6E3A3]">
                        {publicSession.memberAvatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                alt={`${publicSession.memberName} profile`}
                                className="h-full w-full object-cover"
                                src={publicSession.memberAvatarUrl}
                            />
                        ) : (
                            <span>{memberInitials}</span>
                        )}
                    </span>
                    <ChevronDown
                        aria-hidden="true"
                        className={cn('size-3.5 shrink-0 text-white/48 transition-transform', isOpen && 'rotate-180 text-[#F6E3A3]')}
                    />
                </button>
            </div>

            {isOpen ? (
                <div
                    className="absolute right-0 top-[calc(100%+0.55rem)] z-50 w-[min(18.75rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#050505]/96 text-left shadow-[0_18px_58px_rgba(0,0,0,0.52)] backdrop-blur-xl"
                    role="menu">
                    <div className="border-b border-white/8 p-4">
                        <div className="flex min-w-0 items-start gap-2.5">
                            <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[#E6C766]/22 bg-[#101010] text-xs font-extrabold text-[#F6E3A3]">
                                {publicSession.memberAvatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        alt=""
                                        className="h-full w-full object-cover"
                                        src={publicSession.memberAvatarUrl}
                                    />
                                ) : (
                                    <span>{memberInitials}</span>
                                )}
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-bold leading-5 text-white">
                                    {publicSession.memberName}
                                </span>
                                <span className="block truncate text-xs font-medium leading-4 text-[#91A0C5]">
                                    {publicSession.memberEmail || 'Email not set'}
                                </span>
                            </span>
                        </div>

                        <div className="mt-3 rounded-[1rem] border border-white/10 bg-white/[0.018] p-2.5">
                            <div className="flex items-center justify-between gap-2.5">
                                <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-white">
                                    <StatusIcon
                                        aria-hidden="true"
                                        className={cn('size-3.5 shrink-0', isActive ? 'text-emerald-400' : 'text-[#F6A623]')}
                                    />
                                    <span className="truncate">{publicSession.memberStatus}</span>
                                </span>
                                <Link
                                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#F6E3A3] transition hover:text-white"
                                    href={statusActionHref}
                                    onClick={handleMenuLinkClick}>
                                    <span>{publicSession.primaryActionLabel}</span>
                                    <ArrowRight aria-hidden="true" className="size-3" />
                                </Link>
                            </div>

                            <div className="mt-2.5 grid gap-1.5 border-t border-white/8 pt-2.5 text-[0.68rem] font-medium text-white/46">
                                {publicSession.memberNickname ? (
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Nickname</span>
                                        <span className="truncate text-white/76">{publicSession.memberNickname}</span>
                                    </div>
                                ) : null}
                                <div className="flex items-center justify-between gap-3">
                                    <span>Access Code</span>
                                    <span className="truncate font-bold text-[#F6E3A3]">{accessCode ?? 'Not set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid p-1.5">
                        <Link
                            className="flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold text-white/82 transition hover:bg-white/[0.055] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/45"
                            href="/dashboard"
                            onClick={handleMenuLinkClick}
                            role="menuitem">
                            <LayoutDashboard aria-hidden="true" className="size-3.5 text-[#91A0C5]" />
                            <span>Dashboard</span>
                        </Link>
                        <button
                            className="flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-semibold text-white/82 transition hover:bg-white/[0.055] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/45 disabled:cursor-not-allowed disabled:text-white/32"
                            disabled={!accessCode}
                            onClick={handleCopyAccessLink}
                            role="menuitem"
                            type="button">
                            <Clipboard aria-hidden="true" className="size-3.5 text-[#91A0C5]" />
                            <span>{copyState === 'copied' ? 'Access link copied' : copyState === 'error' ? 'Copy not available' : 'Copy Access Link'}</span>
                        </button>
                        <Link
                            className="flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold text-white/82 transition hover:bg-white/[0.055] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/45"
                            href={profileHref}
                            onClick={handleMenuLinkClick}
                            role="menuitem">
                            <Settings aria-hidden="true" className="size-3.5 text-[#91A0C5]" />
                            <span>My Profile</span>
                        </Link>
                        <form action={logoutAction}>
                            <button
                                className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-semibold text-[#FF6B6B] transition hover:bg-red-500/10 hover:text-[#FF8A8A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300/45"
                                role="menuitem"
                                type="submit">
                                <LogOut aria-hidden="true" className="size-3.5" />
                                <span>Sign Out</span>
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

const HeroHeader = ({ publicSession }: { publicSession: PublicSessionState }) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const isSignedIn = publicSession.isAuthenticated
    const primaryActionHref = isSignedIn ? publicSession.primaryActionHref : AUTH_MODAL_ROUTES.signup
    const primaryActionLabel = isSignedIn ? publicSession.primaryActionLabel : 'Sign Up'
    const secondaryActionHref = isSignedIn ? publicSession.secondaryActionHref : AUTH_MODAL_ROUTES.login
    const secondaryActionLabel = isSignedIn ? publicSession.secondaryActionLabel : 'Login'

    function handlePrimaryAction(event: React.MouseEvent<HTMLAnchorElement>) {
        if (isSignedIn) {
            setMenuState(false)
            return
        }

        navigateToAuthModal(event, 'signup', () => setMenuState(false))
    }

    function handleSecondaryAction(event: React.MouseEvent<HTMLAnchorElement>) {
        if (isSignedIn) {
            setMenuState(false)
            return
        }

        navigateToAuthModal(event, 'login', () => setMenuState(false))
    }

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <>
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-50 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 shadow-none transition-[max-width,background-color,box-shadow,backdrop-filter,padding] duration-300 lg:px-12', isScrolled && 'bg-black/90 max-w-4xl rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href={HOME_PATH}
                                aria-label="Back to hero section"
                                onClick={(event) => navigateToHomeSection(event, HOME_PATH, TOP_SECTION_ID, () => setMenuState(false))}
                                className="flex items-center space-x-2">
                                <Logo priority />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm font-medium">
                                {HOME_SECTION_ROUTES.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            onClick={(event) => navigateToHomeSection(event, item.href, item.sectionId, () => setMenuState(false))}
                                            className="text-muted-foreground hover:text-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base font-medium">
                                    {HOME_SECTION_ROUTES.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                onClick={(event) => navigateToHomeSection(event, item.href, item.sectionId, () => setMenuState(false))}
                                                className="text-muted-foreground hover:text-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {isSignedIn ? (
                                <MemberProfileMenu
                                    publicSession={publicSession}
                                    onNavigate={() => setMenuState(false)}
                                />
                            ) : (
                                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                    {secondaryActionHref && secondaryActionLabel ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className={cn('h-9 px-3 text-sm font-medium border-white/10 bg-transparent shadow-none hover:border-white/20 hover:bg-white/5 hover:text-foreground focus-visible:ring-white/20', isScrolled && 'lg:hidden')}>
                                            <Link
                                                href={secondaryActionHref}
                                                onClick={handleSecondaryAction}>
                                                <span>{secondaryActionLabel}</span>
                                            </Link>
                                        </Button>
                                    ) : null}
                                    <Button
                                        asChild
                                        size="sm"
                                        className={cn('elite-gold-orbit h-9 px-3 text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white', isScrolled && 'lg:hidden')}>
                                        <Link
                                            href={primaryActionHref}
                                            onClick={handlePrimaryAction}>
                                            <span>{primaryActionLabel}</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="sm"
                                        className={cn('elite-gold-orbit h-9 px-3 text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white', isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                        <Link
                                            href={primaryActionHref}
                                            onClick={handlePrimaryAction}>
                                            <span>Get Started</span>
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
        </>
    )
}
