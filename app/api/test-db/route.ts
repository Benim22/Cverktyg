import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    console.log("API-anrop: test-db - start")
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    
    // Testa autentisering
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Session-fel:", sessionError)
      return NextResponse.json(
        { error: "Kunde inte hämta session", details: sessionError },
        { status: 500 }
      )
    }
    
    const results: any = { 
      authenticated: !!sessionData.session,
      userId: sessionData.session?.user?.id || null,
      tests: {}
    }
    
    // Om användaren är autentiserad, utför tester
    if (sessionData.session) {
      const userId = sessionData.session.user.id
      
      // Test 1: Hämta tabeller
      try {
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_schema, table_name')
          .eq('table_schema', 'public')
        
        results.tests.tables = {
          success: !tablesError,
          error: tablesError ? tablesError.message : null,
          data: tables
        }
      } catch (e: any) {
        results.tests.tables = {
          success: false,
          error: e.message
        }
      }
      
      // Test 2: Kontrollera om subscriptions-tabellen finns
      try {
        const { data: subscriptionsCheck, error: subscriptionsError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'subscriptions')
          .single()
        
        results.tests.subscriptionsExists = {
          success: !subscriptionsError && !!subscriptionsCheck,
          error: subscriptionsError ? subscriptionsError.message : null,
          exists: !!subscriptionsCheck
        }
      } catch (e: any) {
        results.tests.subscriptionsExists = {
          success: false,
          error: e.message
        }
      }
      
      // Test 3: Hämta kolumner i subscriptions-tabellen om den finns
      if (results.tests.subscriptionsExists?.exists) {
        try {
          const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_schema', 'public')
            .eq('table_name', 'subscriptions')
          
          results.tests.subscriptionsColumns = {
            success: !columnsError,
            error: columnsError ? columnsError.message : null,
            data: columns
          }
        } catch (e: any) {
          results.tests.subscriptionsColumns = {
            success: false,
            error: e.message
          }
        }
      }
      
      // Test 4: Försök göra en SELECT på subscriptions-tabellen
      try {
        const { data: subscriptions, error: selectError } = await supabase
          .from('subscriptions')
          .select('*')
          .limit(1)
        
        results.tests.selectSubscriptions = {
          success: !selectError,
          error: selectError ? selectError.message : null,
          data: subscriptions
        }
      } catch (e: any) {
        results.tests.selectSubscriptions = {
          success: false,
          error: e.message
        }
      }
      
      // Test 5: Försök göra en SELECT på användarspecifik subscriptions
      try {
        const { data: userSubscription, error: userSelectError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .limit(1)
        
        results.tests.selectUserSubscription = {
          success: !userSelectError,
          error: userSelectError ? userSelectError.message : null,
          data: userSubscription
        }
      } catch (e: any) {
        results.tests.selectUserSubscription = {
          success: false,
          error: e.message
        }
      }
      
      // Test 6: Försök göra en INSERT i subscriptions-tabellen och sedan ta bort det
      try {
        // Skapa minimalt test-objekt
        const testSubscription = {
          user_id: userId,
          plan: 'free',
          status: 'active',
          starts_at: new Date().toISOString()
        }
        
        const { data: insertedSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert(testSubscription)
          .select()
        
        // Om insertionen lyckades, ta bort det
        if (!insertError && insertedSub && insertedSub.length > 0) {
          const { error: deleteError } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', insertedSub[0].id)
          
          results.tests.insertDeleteSubscription = {
            success: true,
            insertSuccess: true,
            deleteSuccess: !deleteError,
            insertError: null,
            deleteError: deleteError ? deleteError.message : null
          }
        } else {
          results.tests.insertDeleteSubscription = {
            success: false,
            insertSuccess: false,
            insertError: insertError ? insertError.message : 'Unknown error',
            insertErrorDetails: insertError ? insertError : null
          }
        }
      } catch (e: any) {
        results.tests.insertDeleteSubscription = {
          success: false,
          error: e.message
        }
      }
    }
    
    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Oväntat fel i test-db:", error)
    return NextResponse.json(
      { error: "Ett oväntat fel inträffade", details: error.message },
      { status: 500 }
    )
  }
} 