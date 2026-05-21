
// Mock Supabase client that uses localStorage
class MockSupabaseClient {
  private tables: Record<string, any[]> = {}

  constructor() {
    // Initialize tables from localStorage if available
    if (typeof window !== "undefined") {
      const savedTables = localStorage.getItem("mock-supabase-tables")
      if (savedTables) {
        this.tables = JSON.parse(savedTables)
      } else {
        // Initialize with empty tables
        this.tables = {
          contracts: [],
          signatories: [],
          documents: [],
          approval_tokens: [],
          image_chunks: [],
        }
        this.saveTables()
      }
    }
  }

  private saveTables() {
    if (typeof window !== "undefined") {
      localStorage.setItem("mock-supabase-tables", JSON.stringify(this.tables))
    }
  }

  // Mock the from method to select a table
  from(tableName: string) {
    if (!this.tables[tableName]) {
      this.tables[tableName] = []
      this.saveTables()
    }

    return {
      select: (columns = "*") => this.select(tableName, columns),
      insert: (data: any) => this.insert(tableName, data),
      update: (data: any) => this.update(tableName, data),
      delete: () => this.delete(tableName),
      upsert: (data: any, options: any) => this.upsert(tableName, data, options),
    }
  }

  // Mock select operation
  private select(tableName: string, columns: string) {
    const query = {
      data: this.tables[tableName] || [],
      error: null,
      filters: [] as Array<{ column: string; value: any }>,
      orderBy: null as { column: string; ascending: boolean } | null,
      limitValue: null as number | null,
      limitFromValue: null as number | null,
      singleValue: false,

      eq: function (column: string, value: any) {
        this.filters.push({ column, value })
        return this
      },
      order: function (column: string, { ascending = true } = {}) {
        this.orderBy = { column, ascending }
        return this
      },
      limit: function (value: number) {
        this.limitValue = value
        return this
      },
      single: function () {
        this.singleValue = true
        return this
      },
      execute: function () {
        let result = [...this.data]

        // Apply filters
        for (const filter of this.filters) {
          result = result.filter((item) => {
            if (typeof item[filter.column] === "object" && item[filter.column] !== null) {
              return JSON.stringify(item[filter.column]) === JSON.stringify(filter.value)
            }
            return item[filter.column] === filter.value
          })
        }

        // Apply ordering
        if (this.orderBy) {
          result.sort((a, b) => {
            if (a[this.orderBy!.column] < b[this.orderBy!.column]) {
              return this.orderBy!.ascending ? -1 : 1
            }
            if (a[this.orderBy!.column] > b[this.orderBy!.column]) {
              return this.orderBy!.ascending ? 1 : -1
            }
            return 0
          })
        }

        // Apply limit
        if (this.limitValue !== null) {
          result = result.slice(0, this.limitValue)
        }

        // Return single item if requested
        if (this.singleValue) {
          return {
            data: result.length > 0 ? result[0] : null,
            error: null,
          }
        }

        return {
          data: result,
          error: null,
        }
      },
    }

    return {
      eq: (column: string, value: any) => query.eq(column, value),
      order: (column: string, options: any) => query.order(column, options),
      limit: (value: number) => query.limit(value),
      single: () => query.single(),
      then: (callback: (result: any) => void) => {
        const result = query.execute()
        callback(result)
        return Promise.resolve(result)
      },
      execute: () => query.execute(),
    }
  }

  // Mock insert operation
  private insert(tableName: string, data: any) {
    try {
      if (!Array.isArray(data)) {
        data = [data]
      }

      // Add data to the table
      if (!this.tables[tableName]) {
        this.tables[tableName] = []
      }

      this.tables[tableName] = [...this.tables[tableName], ...data]
      this.saveTables()

      const result = {
        data,
        error: null,
      }

      // Add execute method to the result
      return {
        ...result,
        execute: () => result,
        then: (callback: (result: any) => void) => {
          callback(result)
          return Promise.resolve(result)
        },
        select: () => ({
          ...result,
          execute: () => result,
          then: (callback: (result: any) => void) => {
            callback(result)
            return Promise.resolve(result)
          },
          single: () => ({
            data: data.length > 0 ? data[0] : null,
            error: null,
            execute: () => ({ data: data.length > 0 ? data[0] : null, error: null }),
          }),
        }),
      }
    } catch (error) {
      const errorResult = {
        data: null,
        error: { message: error instanceof Error ? error.message : String(error) },
      }

      // Add execute method to the error result
      return {
        ...errorResult,
        execute: () => errorResult,
        then: (callback: (result: any) => void) => {
          callback(errorResult)
          return Promise.resolve(errorResult)
        },
        select: () => ({
          ...errorResult,
          execute: () => errorResult,
          then: (callback: (result: any) => void) => {
            callback(errorResult)
            return Promise.resolve(errorResult)
          },
          single: () => ({
            data: null,
            error: { message: error instanceof Error ? error.message : String(error) },
            execute: () => ({ data: null, error: { message: error instanceof Error ? error.message : String(error) } }),
          }),
        }),
      }
    }
  }

  // Mock update operation
  private update(tableName: string, data: any) {
    return {
      eq: (column: string, value: any) => {
        try {
          if (!this.tables[tableName]) {
            this.tables[tableName] = []
          }

          const updatedItems = []
          this.tables[tableName] = this.tables[tableName].map((item) => {
            if (item[column] === value) {
              const updatedItem = { ...item, ...data }
              updatedItems.push(updatedItem)
              return updatedItem
            }
            return item
          })

          this.saveTables()

          const result = {
            data: updatedItems,
            error: null,
          }

          // Add execute method to the result
          return {
            ...result,
            execute: () => result,
            then: (callback: (result: any) => void) => {
              callback(result)
              return Promise.resolve(result)
            },
            select: () => ({
              ...result,
              execute: () => result,
              then: (callback: (result: any) => void) => {
                callback(result)
                return Promise.resolve(result)
              },
              single: () => ({
                data: updatedItems.length > 0 ? updatedItems[0] : null,
                error: null,
                execute: () => ({ data: updatedItems.length > 0 ? updatedItems[0] : null, error: null }),
              }),
            }),
          }
        } catch (error) {
          const errorResult = {
            data: null,
            error: { message: error instanceof Error ? error.message : String(error) },
          }

          // Add execute method to the error result
          return {
            ...errorResult,
            execute: () => errorResult,
            then: (callback: (result: any) => void) => {
              callback(errorResult)
              return Promise.resolve(errorResult)
            },
            select: () => ({
              ...errorResult,
              execute: () => errorResult,
              then: (callback: (result: any) => void) => {
                callback(errorResult)
                return Promise.resolve(errorResult)
              },
              single: () => ({
                data: null,
                error: { message: error instanceof Error ? error.message : String(error) },
                execute: () => ({ data: null, error: { message: error instanceof Error ? error.message : String(error) } }),
              }),
            }),
          }
        }
      },
    }
  }

  // Mock delete operation
  private delete(tableName: string) {
    return {
      eq: (column: string, value: any) => {
        try {
          if (!this.tables[tableName]) {
            this.tables[tableName] = []
          }

          const initialLength = this.tables[tableName].length
          this.tables[tableName] = this.tables[tableName].filter((item) => item[column] !== value)
          this.saveTables()

          const result = {
            data: { count: initialLength - this.tables[tableName].length },
            error: null,
          }

          // Add execute method to the result
          return {
            ...result,
            execute: () => result,
            then: (callback: (result: any) => void) => {
              callback(result)
              return Promise.resolve(result)
            },
          }
        } catch (error) {
          const errorResult = {
            data: null,
            error: { message: error instanceof Error ? error.message : String(error) },
          }

          // Add execute method to the error result
          return {
            ...errorResult,
            execute: () => errorResult,
            then: (callback: (result: any) => void) => {
              callback(errorResult)
              return Promise.resolve(errorResult)
            },
          }
        }
      },
    }
  }

  // Mock upsert operation
  private upsert(tableName: string, data: any, options: any = {}) {
    try {
      if (!Array.isArray(data)) {
        data = [data]
      }

      if (!this.tables[tableName]) {
        this.tables[tableName] = []
      }

      const onConflict = options.onConflict || "id"
      const updatedItems = []

      // Process each item
      for (const item of data) {
        const existingIndex = this.tables[tableName].findIndex((existing) => existing[onConflict] === item[onConflict])

        if (existingIndex >= 0) {
          // Update existing item
          this.tables[tableName][existingIndex] = { ...this.tables[tableName][existingIndex], ...item }
          updatedItems.push(this.tables[tableName][existingIndex])
        } else {
          // Insert new item
          this.tables[tableName].push(item)
          updatedItems.push(item)
        }
      }

      this.saveTables()

      const result = {
        data: updatedItems,
        error: null,
      }

      // Add execute method to the result
      return {
        ...result,
        execute: () => result,
        then: (callback: (result: any) => void) => {
          callback(result)
          return Promise.resolve(result)
        },
      }
    } catch (error) {
      const errorResult = {
        data: null,
        error: { message: error instanceof Error ? error.message : String(error) },
      }

      // Add execute method to the error result
      return {
        ...errorResult,
        execute: () => errorResult,
        then: (callback: (result: any) => void) => {
          callback(errorResult)
          return Promise.resolve(errorResult)
        },
      }
    }
  }

  // Mock RPC function
  rpc(functionName: string, params: any) {
    return {
      data: null,
      error: { message: "RPC functions are not supported in the mock implementation" },
      execute: () => ({ data: null, error: { message: "RPC functions are not supported in the mock implementation" } }),
    }
  }
}

// Create a single supabase client for the entire app
let supabaseClient: MockSupabaseClient | null = null

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  // Create a new mock client
  supabaseClient = new MockSupabaseClient()
  return supabaseClient
}

// Server-side client with higher privileges (same as client in this mock)
export async function getServerSupabaseClient() {
  return getSupabaseClient()
}
