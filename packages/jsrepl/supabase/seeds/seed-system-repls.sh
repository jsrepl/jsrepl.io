pnpx esbuild ./supabase/seeds/system-repls.ts --bundle --platform=node --outfile=./supabase/seeds/dist/system-repls.cjs
node ./supabase/seeds/dist/system-repls.cjs
