import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAuthPage = path.startsWith('/welcome') || 
                     path.startsWith('/login') || 
                     path.startsWith('/signup') ||
                     path.startsWith('/forgot-password')

  if (
    !user &&
    !isAuthPage &&
    !path.startsWith('/_next') &&
    !path.startsWith('/api') &&
    !path.startsWith('/auth/callback') &&
    !path.match(/\.(ico|png|jpg|jpeg|svg)$/)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/welcome'
    return NextResponse.redirect(url)
  }

  if (user && !isAuthPage && !path.startsWith('/setup') && 
      !path.startsWith('/_next') && 
      !path.startsWith('/api') &&
      !path.match(/\\.(ico|png|jpg|jpeg|svg)$/)) {
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', user.id)
      .single()

    if (profile && !profile.household_id) {
      const url = request.nextUrl.clone()
      url.pathname = '/setup'
      return NextResponse.redirect(url)
    }
  }
  
  if (user && isAuthPage) {
     const url = request.nextUrl.clone()
     url.pathname = '/'
     return NextResponse.redirect(url)
  }

  return supabaseResponse
}
