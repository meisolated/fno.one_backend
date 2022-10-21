// Segment	Format	Examples
// Equity	{Ex}:{Ex_Symbol}-{Series}	NSE:SBIN-EQ, NSE:ACC-EQ,
// NSE:MODIRUBBER-BE
// BSE:SBIN-A, BSE:ACC-A,
// BSE:MODIRUBBER-T
// Equity Futures	{Ex}:{Ex_UnderlyingSymbol}{YY}{MMM}FUT	NSE:NIFTY20OCTFUT,
// NSE:BANKNIFTY20NOVFUT
// Equity Options (Monthly Expiry)	{Ex}:{Ex_UnderlyingSymbol}{YY}{MMM}{Strike}{Opt_Type}	NSE:NIFTY20OCT11000CE,
// NSE:BANKNIFTY20NOV25000PE
// Equity Options (Monthly Expiry)	{Ex}:{Ex_UnderlyingSymbol}{YY}{MMM}{Strike}{Opt_Type}	NSE:NIFTY20OCT11000CE,
// NSE:BANKNIFTY20NOV25000PE
// Equity Options (Weekly Expiry)	{Ex}:{Ex_UnderlyingSymbol}{YY}{M}{dd}{Strike}{Opt_Type}	NSE:NIFTY20O0811000CE,
// NSE:BANKNIFTY20N0525000PE,
// NSE:NIFTY20D1025000CE
// Currency Futures	{Ex}:{Ex_CurrencyPair}{YY}{MMM}FUT	NSE:USDINR20OCTFUT,
// NSE:GBPINR20NOVFUT
// Currency Options (Monthly Expiry)	Ex}:{Ex_CurrencyPair}{YY}{MMM}{Strike}{Opt_Type}	NSE:USDINR20OCT75CE,
// NSE:GBPINR20NOV80.5PE
// Currency Options (Weekly Expiry)	{Ex}:{Ex_CurrencyPair}{YY}{M}{dd}{Strike}{Opt_Type}	NSE:USDINR20O0875CE,
// NSE:GBPINR20N0580.5PE
// NSE:USDINR20D1075CE
// Commodity Futures	{Ex}:{Ex_Commodity}{YY}{MMM}FUT	MCX:CRUDEOIL20OCTFUT,
// MCX:GOLD20DECFUT
// Commodity Options (Monthly Expiry)	{Ex}:{Ex_Commodity}{YY}{MMM}{Strike}{Opt_Type}	MCX:CRUDEOIL20OCT4000CE,
// MCX:GOLD20DEC40000PE
