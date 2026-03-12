### Kalshi Docs Content Collection (Phase 1)

Generated: 2026-03-04 22:05:30 -08:00

### API Reference / Historical

+----+-----------------------------------------------------------------+
| No | Page                                                            |
+----+-----------------------------------------------------------------+
| 1  | /api-reference/historical/get-historical-cutoff-timestamps.md   |
| 2  | /api-reference/historical/get-historical-fills.md               |
| 3  | /api-reference/historical/get-historical-market.md              |
| 4  | /api-reference/historical/get-historical-market-candlesticks.md |
| 5  | /api-reference/historical/get-historical-markets.md             |
| 6  | /api-reference/historical/get-historical-orders.md              |
+----+-----------------------------------------------------------------+

### /api-reference/historical/get-historical-cutoff-timestamps.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Historical Cutoff Timestamps

> Returns the cutoff timestamps that define the boundary between **live** and **historical** data.

## Cutoff fields
- `market_settled_ts` : Markets that **settled** before this timestamp, and their candlesticks, must be accessed via `GET /historical/markets` and `GET /historical/markets/{ticker}/candlesticks`.
- `trades_created_ts` : Trades that were **filled** before this timestamp must be accessed via `GET /historical/fills`.
- `orders_updated_ts` : Orders that were **canceled or fully executed** before this timestamp must be accessed via `GET /historical/orders`. Resting (active) orders are always available in `GET /portfolio/orders`.




## OpenAPI

````yaml openapi.yaml get /historical/cutoff
openapi: 3.0.0
info:
  title: Kalshi Trade API Manual Endpoints
  version: 3.8.0
  description: >-
    Manually defined OpenAPI spec for endpoints being migrated to spec-first
    approach
servers:
  - url: https://api.elections.kalshi.com/trade-api/v2
    description: Production server
security: []
tags:
  - name: api-keys
    description: API key management endpoints
  - name: orders
    description: Order management endpoints
  - name: order-groups
    description: Order group management endpoints
  - name: portfolio
    description: Portfolio and balance information endpoints
  - name: communications
    description: Request-for-quote (RFQ) endpoints
  - name: multivariate
    description: Multivariate event collection endpoints
  - name: exchange
    description: Exchange status and information endpoints
  - name: live-data
    description: Live data endpoints
  - name: markets
    description: Market data endpoints
  - name: milestone
    description: Milestone endpoints
  - name: search
    description: Search and filtering endpoints
  - name: incentive-programs
    description: Incentive program endpoints
  - name: fcm
    description: FCM member specific endpoints
  - name: events
    description: Event endpoints
  - name: structured-targets
    description: Structured targets endpoints
paths:
  /historical/cutoff:
    get:
      tags:
        - historical
      summary: Get Historical Cutoff Timestamps
      description: >
        Returns the cutoff timestamps that define the boundary between **live**
        and **historical** data.


        ## Cutoff fields

        - `market_settled_ts` : Markets that **settled** before this timestamp,
        and their candlesticks, must be accessed via `GET /historical/markets`
        and `GET /historical/markets/{ticker}/candlesticks`.

        - `trades_created_ts` : Trades that were **filled** before this
        timestamp must be accessed via `GET /historical/fills`.

        - `orders_updated_ts` : Orders that were **canceled or fully executed**
        before this timestamp must be accessed via `GET /historical/orders`.
        Resting (active) orders are always available in `GET /portfolio/orders`.
      operationId: GetHistoricalCutoff
      responses:
        '200':
          description: Historical cutoff timestamps retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetHistoricalCutoffResponse'
        '500':
          description: Internal server error
components:
  schemas:
    GetHistoricalCutoffResponse:
      type: object
      required:
        - market_settled_ts
        - trades_created_ts
        - orders_updated_ts
      properties:
        market_settled_ts:
          type: string
          format: date-time
          description: >
            Cutoff based on **market settlement time**. Markets and their
            candlesticks that settled before this timestamp must be accessed via
            `GET /historical/markets` and `GET
            /historical/markets/{ticker}/candlesticks`.
        trades_created_ts:
          type: string
          format: date-time
          description: >
            Cutoff based on **trade fill time**. Fills that occurred before this
            timestamp must be accessed via `GET /historical/fills`.
        orders_updated_ts:
          type: string
          format: date-time
          description: >
            Cutoff based on **order cancellation or execution time**. Orders
            canceled or fully executed before this timestamp must be accessed
            via `GET /historical/orders`. Resting (active) orders are always
            available in `GET /portfolio/orders`.

````

### /api-reference/historical/get-historical-fills.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Historical Fills

>  Endpoint for getting all historical fills for the member. A fill is when a trade you have is matched.



## OpenAPI

````yaml openapi.yaml get /historical/fills
openapi: 3.0.0
info:
  title: Kalshi Trade API Manual Endpoints
  version: 3.8.0
  description: >-
    Manually defined OpenAPI spec for endpoints being migrated to spec-first
    approach
servers:
  - url: https://api.elections.kalshi.com/trade-api/v2
    description: Production server
security: []
tags:
  - name: api-keys
    description: API key management endpoints
  - name: orders
    description: Order management endpoints
  - name: order-groups
    description: Order group management endpoints
  - name: portfolio
    description: Portfolio and balance information endpoints
  - name: communications
    description: Request-for-quote (RFQ) endpoints
  - name: multivariate
    description: Multivariate event collection endpoints
  - name: exchange
    description: Exchange status and information endpoints
  - name: live-data
    description: Live data endpoints
  - name: markets
    description: Market data endpoints
  - name: milestone
    description: Milestone endpoints
  - name: search
    description: Search and filtering endpoints
  - name: incentive-programs
    description: Incentive program endpoints
  - name: fcm
    description: FCM member specific endpoints
  - name: events
    description: Event endpoints
  - name: structured-targets
    description: Structured targets endpoints
paths:
  /historical/fills:
    get:
      tags:
        - historical
      summary: Get Historical Fills
      description: ' Endpoint for getting all historical fills for the member. A fill is when a trade you have is matched.'
      operationId: GetFillsHistorical
      parameters:
        - $ref: '#/components/parameters/TickerQuery'
        - $ref: '#/components/parameters/MaxTsQuery'
        - $ref: '#/components/parameters/LimitQuery'
        - $ref: '#/components/parameters/CursorQuery'
      responses:
        '200':
          description: Fills retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetFillsResponse'
        '400':
          description: Bad request
        '401':
          description: Unauthorized
        '500':
          description: Internal server error
      security:
        - kalshiAccessKey: []
          kalshiAccessSignature: []
          kalshiAccessTimestamp: []
components:
  parameters:
    TickerQuery:
      name: ticker
      in: query
      description: Filter by market ticker
      schema:
        type: string
        x-go-type-skip-optional-pointer: true
    MaxTsQuery:
      name: max_ts
      in: query
      description: Filter items before this Unix timestamp
      schema:
        type: integer
        format: int64
    LimitQuery:
      name: limit
      in: query
      description: Number of results per page. Defaults to 100. Maximum value is 200.
      schema:
        type: integer
        format: int64
        minimum: 1
        maximum: 200
        default: 100
        x-oapi-codegen-extra-tags:
          validate: omitempty,min=1,max=200
    CursorQuery:
      name: cursor
      in: query
      description: >-
        Pagination cursor. Use the cursor value returned from the previous
        response to get the next page of results. Leave empty for the first
        page.
      schema:
        type: string
        x-go-type-skip-optional-pointer: true
  schemas:
    GetFillsResponse:
      type: object
      required:
        - fills
        - cursor
      properties:
        fills:
          type: array
          items:
            $ref: '#/components/schemas/Fill'
        cursor:
          type: string
    Fill:
      type: object
      required:
        - fill_id
        - trade_id
        - order_id
        - ticker
        - market_ticker
        - side
        - action
        - count
        - count_fp
        - price
        - yes_price
        - no_price
        - yes_price_fixed
        - no_price_fixed
        - is_taker
        - fee_cost
      properties:
        fill_id:
          type: string
          description: Unique identifier for this fill
        trade_id:
          type: string
          description: Unique identifier for this fill (legacy field name, same as fill_id)
        order_id:
          type: string
          description: Unique identifier for the order that resulted in this fill
        client_order_id:
          type: string
          description: Client-provided identifier for the order that resulted in this fill
        ticker:
          type: string
          description: Unique identifier for the market
        market_ticker:
          type: string
          description: Unique identifier for the market (legacy field name, same as ticker)
        side:
          type: string
          enum:
            - 'yes'
            - 'no'
          description: Specifies if this is a 'yes' or 'no' fill
        action:
          type: string
          enum:
            - buy
            - sell
          description: Specifies if this is a buy or sell order
        count:
          type: integer
          description: Number of contracts bought or sold in this fill
        count_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            String representation of the number of contracts bought or sold in
            this fill
        price:
          type: number
          description: Fill price (deprecated - use yes_price or no_price)
        yes_price:
          type: integer
          description: Fill price for the yes side in cents
        no_price:
          type: integer
          description: Fill price for the no side in cents
        yes_price_fixed:
          type: string
          description: Fill price for the yes side in fixed point dollars
        no_price_fixed:
          type: string
          description: Fill price for the no side in fixed point dollars
        is_taker:
          type: boolean
          description: >-
            If true, this fill was a taker (removed liquidity from the order
            book)
        created_time:
          type: string
          format: date-time
          description: Timestamp when this fill was executed
        fee_cost:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Fee cost in centi-cents
        subaccount_number:
          type: integer
          nullable: true
          x-omitempty: true
          description: >-
            Subaccount number (0 for primary, 1-32 for subaccounts). Present for
            direct users.
        ts:
          type: integer
          format: int64
          description: Unix timestamp when this fill was executed (legacy field name)
    FixedPointCount:
      type: string
      description: >-
        Fixed-point contract count string (2 decimals, e.g., "10.00"; referred
        to as "fp" in field names). Requests accept 0–2 decimal places (e.g.,
        "10", "10.0", "10.00"); responses always emit 2 decimals. Currently only
        whole contract values are permitted, but the format supports future
        fractional precision. Integer contract count fields are legacy and will
        be deprecated; when both integer and fp fields are provided, they must
        match.
      example: '10.00'
    FixedPointDollars:
      type: string
      description: >-
        US dollar amount as a fixed-point decimal string with up to 4 decimal
        places of precision. This is the maximum supported precision; valid
        quote intervals for a given market are constrained by that market's
        price level structure.
      example: '0.5600'
  securitySchemes:
    kalshiAccessKey:
      type: apiKey
      in: header
      name: KALSHI-ACCESS-KEY
      description: Your API key ID
    kalshiAccessSignature:
      type: apiKey
      in: header
      name: KALSHI-ACCESS-SIGNATURE
      description: RSA-PSS signature of the request
    kalshiAccessTimestamp:
      type: apiKey
      in: header
      name: KALSHI-ACCESS-TIMESTAMP
      description: Request timestamp in milliseconds

````

### /api-reference/historical/get-historical-market.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Historical Market

>  Endpoint for getting data about a specific market by its ticker from the historical database.



## OpenAPI

````yaml openapi.yaml get /historical/markets/{ticker}
openapi: 3.0.0
info:
  title: Kalshi Trade API Manual Endpoints
  version: 3.8.0
  description: >-
    Manually defined OpenAPI spec for endpoints being migrated to spec-first
    approach
servers:
  - url: https://api.elections.kalshi.com/trade-api/v2
    description: Production server
security: []
tags:
  - name: api-keys
    description: API key management endpoints
  - name: orders
    description: Order management endpoints
  - name: order-groups
    description: Order group management endpoints
  - name: portfolio
    description: Portfolio and balance information endpoints
  - name: communications
    description: Request-for-quote (RFQ) endpoints
  - name: multivariate
    description: Multivariate event collection endpoints
  - name: exchange
    description: Exchange status and information endpoints
  - name: live-data
    description: Live data endpoints
  - name: markets
    description: Market data endpoints
  - name: milestone
    description: Milestone endpoints
  - name: search
    description: Search and filtering endpoints
  - name: incentive-programs
    description: Incentive program endpoints
  - name: fcm
    description: FCM member specific endpoints
  - name: events
    description: Event endpoints
  - name: structured-targets
    description: Structured targets endpoints
paths:
  /historical/markets/{ticker}:
    get:
      tags:
        - historical
      summary: Get Historical Market
      description: ' Endpoint for getting data about a specific market by its ticker from the historical database.'
      operationId: GetHistoricalMarket
      parameters:
        - $ref: '#/components/parameters/TickerPath'
      responses:
        '200':
          description: Historical market retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetMarketResponse'
        '404':
          $ref: '#/components/responses/NotFoundError'
        '500':
          $ref: '#/components/responses/InternalServerError'
components:
  parameters:
    TickerPath:
      name: ticker
      in: path
      required: true
      description: Market ticker
      schema:
        type: string
  schemas:
    GetMarketResponse:
      type: object
      required:
        - market
      properties:
        market:
          $ref: '#/components/schemas/Market'
    Market:
      type: object
      required:
        - ticker
        - event_ticker
        - market_type
        - title
        - subtitle
        - yes_sub_title
        - no_sub_title
        - created_time
        - updated_time
        - open_time
        - close_time
        - expiration_time
        - latest_expiration_time
        - settlement_timer_seconds
        - status
        - response_price_units
        - notional_value
        - notional_value_dollars
        - yes_bid
        - yes_bid_dollars
        - yes_ask
        - yes_ask_dollars
        - no_bid
        - no_bid_dollars
        - no_ask
        - no_ask_dollars
        - yes_bid_size_fp
        - yes_ask_size_fp
        - last_price
        - last_price_dollars
        - previous_yes_bid
        - previous_yes_bid_dollars
        - previous_yes_ask
        - previous_yes_ask_dollars
        - previous_price
        - previous_price_dollars
        - volume
        - volume_fp
        - volume_24h
        - volume_24h_fp
        - liquidity
        - liquidity_dollars
        - open_interest
        - open_interest_fp
        - result
        - can_close_early
        - fractional_trading_enabled
        - expiration_value
        - rules_primary
        - rules_secondary
        - tick_size
        - price_level_structure
        - price_ranges
      properties:
        ticker:
          type: string
        event_ticker:
          type: string
        market_type:
          type: string
          enum:
            - binary
            - scalar
          description: Identifies the type of market
        title:
          type: string
          deprecated: true
        subtitle:
          type: string
          deprecated: true
        yes_sub_title:
          type: string
          description: Shortened title for the yes side of this market
        no_sub_title:
          type: string
          description: Shortened title for the no side of this market
        created_time:
          type: string
          format: date-time
        updated_time:
          type: string
          format: date-time
          description: Time of the last non-trading metadata update.
        open_time:
          type: string
          format: date-time
        close_time:
          type: string
          format: date-time
        expected_expiration_time:
          type: string
          format: date-time
          nullable: true
          x-omitempty: true
          description: Time when this market is expected to expire
        expiration_time:
          type: string
          format: date-time
          deprecated: true
        latest_expiration_time:
          type: string
          format: date-time
          description: Latest possible time for this market to expire
        settlement_timer_seconds:
          type: integer
          description: The amount of time after determination that the market settles
        status:
          type: string
          enum:
            - initialized
            - inactive
            - active
            - closed
            - determined
            - disputed
            - amended
            - finalized
          description: The current status of the market in its lifecycle.
        response_price_units:
          type: string
          enum:
            - usd_cent
          deprecated: true
          description: 'DEPRECATED: Use price_level_structure and price_ranges instead.'
        yes_bid:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use yes_bid_dollars instead.'
        yes_bid_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the highest YES buy offer on this market in dollars
        yes_bid_size_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            Total contract size of orders to buy YES at the best bid price
            (fixed-point count string).
        yes_ask:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use yes_ask_dollars instead.'
        yes_ask_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the lowest YES sell offer on this market in dollars
        yes_ask_size_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            Total contract size of orders to sell YES at the best ask price
            (fixed-point count string).
        no_bid:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use no_bid_dollars instead.'
        no_bid_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the highest NO buy offer on this market in dollars
        no_ask:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use no_ask_dollars instead.'
        no_ask_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the lowest NO sell offer on this market in dollars
        last_price:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use last_price_dollars instead.'
        last_price_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the last traded YES contract on this market in dollars
        volume:
          type: integer
        volume_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: String representation of the market volume in contracts
        volume_24h:
          type: integer
        volume_24h_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: String representation of the 24h market volume in contracts
        result:
          type: string
          enum:
            - 'yes'
            - 'no'
            - scalar
            - ''
        can_close_early:
          type: boolean
        fractional_trading_enabled:
          type: boolean
        open_interest:
          type: integer
          description: Number of contracts bought on this market disconsidering netting
        open_interest_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            String representation of the number of contracts bought on this
            market disconsidering netting
        notional_value:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use notional_value_dollars instead.'
        notional_value_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: The total value of a single contract at settlement in dollars
        previous_yes_bid:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use previous_yes_bid_dollars instead.'
        previous_yes_bid_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Price for the highest YES buy offer on this market a day ago in
            dollars
        previous_yes_ask:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use previous_yes_ask_dollars instead.'
        previous_yes_ask_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Price for the lowest YES sell offer on this market a day ago in
            dollars
        previous_price:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use previous_price_dollars instead.'
        previous_price_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Price for the last traded YES contract on this market a day ago in
            dollars
        liquidity:
          type: integer
          deprecated: true
          description: 'DEPRECATED: This field is deprecated and will always return 0.'
        liquidity_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          deprecated: true
          description: >-
            DEPRECATED: This field is deprecated and will always return
            "0.0000".
        settlement_value:
          type: integer
          nullable: true
          x-omitempty: true
          description: >-
            The settlement value of the YES/LONG side of the contract in cents.
            Only filled after determination
        settlement_value_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          x-omitempty: true
          description: >-
            The settlement value of the YES/LONG side of the contract in
            dollars. Only filled after determination
        settlement_ts:
          type: string
          format: date-time
          nullable: true
          x-omitempty: true
          description: >-
            Timestamp when the market was settled. Only filled for settled
            markets
        expiration_value:
          type: string
          description: The value that was considered for the settlement
        fee_waiver_expiration_time:
          type: string
          format: date-time
          nullable: true
          x-omitempty: true
          description: Time when this market's fee waiver expires
        early_close_condition:
          type: string
          nullable: true
          x-omitempty: true
          description: The condition under which the market can close early
          x-go-type-skip-optional-pointer: true
        tick_size:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use price_level_structure and price_ranges instead.'
        strike_type:
          type: string
          enum:
            - greater
            - greater_or_equal
            - less
            - less_or_equal
            - between
            - functional
            - custom
            - structured
          x-omitempty: true
          description: Strike type defines how the market strike is defined and evaluated
          x-go-type-skip-optional-pointer: true
        floor_strike:
          type: number
          format: double
          nullable: true
          x-omitempty: true
          description: Minimum expiration value that leads to a YES settlement
        cap_strike:
          type: number
          format: double
          nullable: true
          x-omitempty: true
          description: Maximum expiration value that leads to a YES settlement
        functional_strike:
          type: string
          nullable: true
          x-omitempty: true
          description: Mapping from expiration values to settlement values
        custom_strike:
          type: object
          nullable: true
          x-omitempty: true
          description: Expiration value for each target that leads to a YES settlement
        rules_primary:
          type: string
          description: A plain language description of the most important market terms
        rules_secondary:
          type: string
          description: A plain language description of secondary market terms
        mve_collection_ticker:
          type: string
          x-omitempty: true
          description: The ticker of the multivariate event collection
          x-go-type-skip-optional-pointer: true
        mve_selected_legs:
          type: array
          x-omitempty: true
          items:
            $ref: '#/components/schemas/MveSelectedLeg'
          x-go-type-skip-optional-pointer: true
        primary_participant_key:
          type: string
          nullable: true
          x-omitempty: true
        price_level_structure:
          type: string
          description: >-
            Price level structure for this market, defining price ranges and
            tick sizes
        price_ranges:
          type: array
          description: Valid price ranges for orders on this market
          items:
            $ref: '#/components/schemas/PriceRange'
        is_provisional:
          type: boolean
          x-omitempty: true
          description: >-
            If true, the market may be removed after determination if there is
            no activity on it
          x-go-type-skip-optional-pointer: true
    ErrorResponse:
      type: object
      properties:
        code:
          type: string
          description: Error code
        message:
          type: string
          description: Human-readable error message
        details:
          type: string
          description: Additional details about the error, if available
        service:
          type: string
          description: The name of the service that generated the error
    FixedPointDollars:
      type: string
      description: >-
        US dollar amount as a fixed-point decimal string with up to 4 decimal
        places of precision. This is the maximum supported precision; valid
        quote intervals for a given market are constrained by that market's
        price level structure.
      example: '0.5600'
    FixedPointCount:
      type: string
      description: >-
        Fixed-point contract count string (2 decimals, e.g., "10.00"; referred
        to as "fp" in field names). Requests accept 0–2 decimal places (e.g.,
        "10", "10.0", "10.00"); responses always emit 2 decimals. Currently only
        whole contract values are permitted, but the format supports future
        fractional precision. Integer contract count fields are legacy and will
        be deprecated; when both integer and fp fields are provided, they must
        match.
      example: '10.00'
    MveSelectedLeg:
      type: object
      properties:
        event_ticker:
          type: string
          description: Unique identifier for the selected event
          x-go-type-skip-optional-pointer: true
        market_ticker:
          type: string
          description: Unique identifier for the selected market
          x-go-type-skip-optional-pointer: true
        side:
          type: string
          description: The side of the selected market
          x-go-type-skip-optional-pointer: true
        yes_settlement_value_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          x-omitempty: true
          description: >-
            The settlement value of the YES/LONG side of the contract in
            dollars. Only filled after determination
    PriceRange:
      type: object
      required:
        - start
        - end
        - step
      properties:
        start:
          type: string
          description: Starting price for this range in dollars
        end:
          type: string
          description: Ending price for this range in dollars
        step:
          type: string
          description: Price step/tick size for this range in dollars
  responses:
    NotFoundError:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

````

### /api-reference/historical/get-historical-market-candlesticks.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Historical Market Candlesticks

>  Endpoint for fetching historical candlestick data for markets that have been archived from the live data set. Time period length of each candlestick in minutes. Valid values: 1 (1 minute), 60 (1 hour), 1440 (1 day).



## OpenAPI

````yaml openapi.yaml get /historical/markets/{ticker}/candlesticks
openapi: 3.0.0
info:
  title: Kalshi Trade API Manual Endpoints
  version: 3.8.0
  description: >-
    Manually defined OpenAPI spec for endpoints being migrated to spec-first
    approach
servers:
  - url: https://api.elections.kalshi.com/trade-api/v2
    description: Production server
security: []
tags:
  - name: api-keys
    description: API key management endpoints
  - name: orders
    description: Order management endpoints
  - name: order-groups
    description: Order group management endpoints
  - name: portfolio
    description: Portfolio and balance information endpoints
  - name: communications
    description: Request-for-quote (RFQ) endpoints
  - name: multivariate
    description: Multivariate event collection endpoints
  - name: exchange
    description: Exchange status and information endpoints
  - name: live-data
    description: Live data endpoints
  - name: markets
    description: Market data endpoints
  - name: milestone
    description: Milestone endpoints
  - name: search
    description: Search and filtering endpoints
  - name: incentive-programs
    description: Incentive program endpoints
  - name: fcm
    description: FCM member specific endpoints
  - name: events
    description: Event endpoints
  - name: structured-targets
    description: Structured targets endpoints
paths:
  /historical/markets/{ticker}/candlesticks:
    get:
      tags:
        - historical
      summary: Get Historical Market Candlesticks
      description: ' Endpoint for fetching historical candlestick data for markets that have been archived from the live data set. Time period length of each candlestick in minutes. Valid values: 1 (1 minute), 60 (1 hour), 1440 (1 day).'
      operationId: GetMarketCandlesticksHistorical
      parameters:
        - name: ticker
          in: path
          required: true
          description: Market ticker - unique identifier for the specific market
          schema:
            type: string
        - name: start_ts
          in: query
          required: true
          description: >-
            Start timestamp (Unix timestamp). Candlesticks will include those
            ending on or after this time.
          schema:
            type: integer
            format: int64
        - name: end_ts
          in: query
          required: true
          description: >-
            End timestamp (Unix timestamp). Candlesticks will include those
            ending on or before this time.
          schema:
            type: integer
            format: int64
        - name: period_interval
          in: query
          required: true
          description: >-
            Time period length of each candlestick in minutes. Valid values are
            1 (1 minute), 60 (1 hour), or 1440 (1 day).
          schema:
            type: integer
            enum:
              - 1
              - 60
              - 1440
          x-oapi-codegen-extra-tags:
            validate: required,oneof=1 60 1440
      responses:
        '200':
          description: Candlesticks retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetMarketCandlesticksHistoricalResponse'
        '400':
          description: Bad request
        '404':
          description: Not found
        '500':
          description: Internal server error
components:
  schemas:
    GetMarketCandlesticksHistoricalResponse:
      type: object
      required:
        - ticker
        - candlesticks
      properties:
        ticker:
          type: string
          description: Unique identifier for the market.
        candlesticks:
          type: array
          description: Array of candlestick data points for the specified time range.
          items:
            $ref: '#/components/schemas/MarketCandlestickHistorical'
    MarketCandlestickHistorical:
      type: object
      required:
        - end_period_ts
        - yes_bid
        - yes_ask
        - price
        - volume
        - open_interest
      properties:
        end_period_ts:
          type: integer
          format: int64
          description: Unix timestamp for the inclusive end of the candlestick period.
        yes_bid:
          $ref: '#/components/schemas/BidAskDistributionHistorical'
          description: >-
            Open, high, low, close (OHLC) data for YES buy offers on the market
            during the candlestick period.
        yes_ask:
          $ref: '#/components/schemas/BidAskDistributionHistorical'
          description: >-
            Open, high, low, close (OHLC) data for YES sell offers on the market
            during the candlestick period.
        price:
          $ref: '#/components/schemas/PriceDistributionHistorical'
          description: >-
            Open, high, low, close (OHLC) and more data for trade YES contract
            prices on the market during the candlestick period.
        volume:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            String representation of the number of contracts bought on the
            market during the candlestick period.
        open_interest:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            String representation of the number of contracts bought on the
            market by end of the candlestick period (end_period_ts).
    BidAskDistributionHistorical:
      type: object
      required:
        - open
        - low
        - high
        - close
      properties:
        open:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Offer price on the market at the start of the candlestick period (in
            dollars).
        low:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Lowest offer price on the market during the candlestick period (in
            dollars).
        high:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Highest offer price on the market during the candlestick period (in
            dollars).
        close:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Offer price on the market at the end of the candlestick period (in
            dollars).
    PriceDistributionHistorical:
      type: object
      required:
        - open
        - low
        - high
        - close
        - mean
        - previous
      properties:
        open:
          allOf:
            - $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          description: >-
            Price of the first trade during the candlestick period (in dollars).
            Null if no trades occurred.
        low:
          allOf:
            - $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          description: >-
            Lowest trade price during the candlestick period (in dollars). Null
            if no trades occurred.
        high:
          allOf:
            - $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          description: >-
            Highest trade price during the candlestick period (in dollars). Null
            if no trades occurred.
        close:
          allOf:
            - $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          description: >-
            Price of the last trade during the candlestick period (in dollars).
            Null if no trades occurred.
        mean:
          allOf:
            - $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          description: >-
            Volume-weighted average price during the candlestick period (in
            dollars). Null if no trades occurred.
        previous:
          allOf:
            - $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          description: >-
            Close price from the previous candlestick period (in dollars). Null
            if this is the first candlestick or no prior trade exists.
    FixedPointCount:
      type: string
      description: >-
        Fixed-point contract count string (2 decimals, e.g., "10.00"; referred
        to as "fp" in field names). Requests accept 0–2 decimal places (e.g.,
        "10", "10.0", "10.00"); responses always emit 2 decimals. Currently only
        whole contract values are permitted, but the format supports future
        fractional precision. Integer contract count fields are legacy and will
        be deprecated; when both integer and fp fields are provided, they must
        match.
      example: '10.00'
    FixedPointDollars:
      type: string
      description: >-
        US dollar amount as a fixed-point decimal string with up to 4 decimal
        places of precision. This is the maximum supported precision; valid
        quote intervals for a given market are constrained by that market's
        price level structure.
      example: '0.5600'

````

### /api-reference/historical/get-historical-markets.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Historical Markets

> Endpoint for getting markets that have been archived to the historical database. Filters are mutually exclusive.




## OpenAPI

````yaml openapi.yaml get /historical/markets
openapi: 3.0.0
info:
  title: Kalshi Trade API Manual Endpoints
  version: 3.8.0
  description: >-
    Manually defined OpenAPI spec for endpoints being migrated to spec-first
    approach
servers:
  - url: https://api.elections.kalshi.com/trade-api/v2
    description: Production server
security: []
tags:
  - name: api-keys
    description: API key management endpoints
  - name: orders
    description: Order management endpoints
  - name: order-groups
    description: Order group management endpoints
  - name: portfolio
    description: Portfolio and balance information endpoints
  - name: communications
    description: Request-for-quote (RFQ) endpoints
  - name: multivariate
    description: Multivariate event collection endpoints
  - name: exchange
    description: Exchange status and information endpoints
  - name: live-data
    description: Live data endpoints
  - name: markets
    description: Market data endpoints
  - name: milestone
    description: Milestone endpoints
  - name: search
    description: Search and filtering endpoints
  - name: incentive-programs
    description: Incentive program endpoints
  - name: fcm
    description: FCM member specific endpoints
  - name: events
    description: Event endpoints
  - name: structured-targets
    description: Structured targets endpoints
paths:
  /historical/markets:
    get:
      tags:
        - historical
      summary: Get Historical Markets
      description: >
        Endpoint for getting markets that have been archived to the historical
        database. Filters are mutually exclusive.
      operationId: GetHistoricalMarkets
      parameters:
        - $ref: '#/components/parameters/MarketLimitQuery'
        - $ref: '#/components/parameters/CursorQuery'
        - $ref: '#/components/parameters/TickersQuery'
        - $ref: '#/components/parameters/SingleEventTickerQuery'
        - $ref: '#/components/parameters/MveHistoricalFilterQuery'
      responses:
        '200':
          description: Historical markets retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetMarketsResponse'
        '400':
          $ref: '#/components/responses/BadRequestError'
        '500':
          $ref: '#/components/responses/InternalServerError'
components:
  parameters:
    MarketLimitQuery:
      name: limit
      in: query
      description: Number of results per page. Defaults to 100. Maximum value is 1000.
      schema:
        type: integer
        format: int64
        minimum: 1
        maximum: 1000
        default: 100
        x-oapi-codegen-extra-tags:
          validate: omitempty,gte=1,lte=1000
    CursorQuery:
      name: cursor
      in: query
      description: >-
        Pagination cursor. Use the cursor value returned from the previous
        response to get the next page of results. Leave empty for the first
        page.
      schema:
        type: string
        x-go-type-skip-optional-pointer: true
    TickersQuery:
      name: tickers
      in: query
      description: >-
        Filter by specific market tickers. Comma-separated list of market
        tickers to retrieve.
      schema:
        type: string
    SingleEventTickerQuery:
      name: event_ticker
      in: query
      description: Event ticker to filter by. Only a single event ticker is supported.
      schema:
        type: string
        x-go-type-skip-optional-pointer: true
    MveHistoricalFilterQuery:
      name: mve_filter
      in: query
      description: >-
        Filter by multivariate events (combos). By default, MVE markets are
        included.
      schema:
        type: string
        enum:
          - exclude
        nullable: true
        default: null
  schemas:
    GetMarketsResponse:
      type: object
      required:
        - markets
        - cursor
      properties:
        markets:
          type: array
          items:
            $ref: '#/components/schemas/Market'
        cursor:
          type: string
    Market:
      type: object
      required:
        - ticker
        - event_ticker
        - market_type
        - title
        - subtitle
        - yes_sub_title
        - no_sub_title
        - created_time
        - updated_time
        - open_time
        - close_time
        - expiration_time
        - latest_expiration_time
        - settlement_timer_seconds
        - status
        - response_price_units
        - notional_value
        - notional_value_dollars
        - yes_bid
        - yes_bid_dollars
        - yes_ask
        - yes_ask_dollars
        - no_bid
        - no_bid_dollars
        - no_ask
        - no_ask_dollars
        - yes_bid_size_fp
        - yes_ask_size_fp
        - last_price
        - last_price_dollars
        - previous_yes_bid
        - previous_yes_bid_dollars
        - previous_yes_ask
        - previous_yes_ask_dollars
        - previous_price
        - previous_price_dollars
        - volume
        - volume_fp
        - volume_24h
        - volume_24h_fp
        - liquidity
        - liquidity_dollars
        - open_interest
        - open_interest_fp
        - result
        - can_close_early
        - fractional_trading_enabled
        - expiration_value
        - rules_primary
        - rules_secondary
        - tick_size
        - price_level_structure
        - price_ranges
      properties:
        ticker:
          type: string
        event_ticker:
          type: string
        market_type:
          type: string
          enum:
            - binary
            - scalar
          description: Identifies the type of market
        title:
          type: string
          deprecated: true
        subtitle:
          type: string
          deprecated: true
        yes_sub_title:
          type: string
          description: Shortened title for the yes side of this market
        no_sub_title:
          type: string
          description: Shortened title for the no side of this market
        created_time:
          type: string
          format: date-time
        updated_time:
          type: string
          format: date-time
          description: Time of the last non-trading metadata update.
        open_time:
          type: string
          format: date-time
        close_time:
          type: string
          format: date-time
        expected_expiration_time:
          type: string
          format: date-time
          nullable: true
          x-omitempty: true
          description: Time when this market is expected to expire
        expiration_time:
          type: string
          format: date-time
          deprecated: true
        latest_expiration_time:
          type: string
          format: date-time
          description: Latest possible time for this market to expire
        settlement_timer_seconds:
          type: integer
          description: The amount of time after determination that the market settles
        status:
          type: string
          enum:
            - initialized
            - inactive
            - active
            - closed
            - determined
            - disputed
            - amended
            - finalized
          description: The current status of the market in its lifecycle.
        response_price_units:
          type: string
          enum:
            - usd_cent
          deprecated: true
          description: 'DEPRECATED: Use price_level_structure and price_ranges instead.'
        yes_bid:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use yes_bid_dollars instead.'
        yes_bid_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the highest YES buy offer on this market in dollars
        yes_bid_size_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            Total contract size of orders to buy YES at the best bid price
            (fixed-point count string).
        yes_ask:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use yes_ask_dollars instead.'
        yes_ask_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the lowest YES sell offer on this market in dollars
        yes_ask_size_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            Total contract size of orders to sell YES at the best ask price
            (fixed-point count string).
        no_bid:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use no_bid_dollars instead.'
        no_bid_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the highest NO buy offer on this market in dollars
        no_ask:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use no_ask_dollars instead.'
        no_ask_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the lowest NO sell offer on this market in dollars
        last_price:
          type: number
          deprecated: true
          description: 'DEPRECATED: Use last_price_dollars instead.'
        last_price_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: Price for the last traded YES contract on this market in dollars
        volume:
          type: integer
        volume_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: String representation of the market volume in contracts
        volume_24h:
          type: integer
        volume_24h_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: String representation of the 24h market volume in contracts
        result:
          type: string
          enum:
            - 'yes'
            - 'no'
            - scalar
            - ''
        can_close_early:
          type: boolean
        fractional_trading_enabled:
          type: boolean
        open_interest:
          type: integer
          description: Number of contracts bought on this market disconsidering netting
        open_interest_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            String representation of the number of contracts bought on this
            market disconsidering netting
        notional_value:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use notional_value_dollars instead.'
        notional_value_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: The total value of a single contract at settlement in dollars
        previous_yes_bid:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use previous_yes_bid_dollars instead.'
        previous_yes_bid_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Price for the highest YES buy offer on this market a day ago in
            dollars
        previous_yes_ask:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use previous_yes_ask_dollars instead.'
        previous_yes_ask_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Price for the lowest YES sell offer on this market a day ago in
            dollars
        previous_price:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use previous_price_dollars instead.'
        previous_price_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: >-
            Price for the last traded YES contract on this market a day ago in
            dollars
        liquidity:
          type: integer
          deprecated: true
          description: 'DEPRECATED: This field is deprecated and will always return 0.'
        liquidity_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          deprecated: true
          description: >-
            DEPRECATED: This field is deprecated and will always return
            "0.0000".
        settlement_value:
          type: integer
          nullable: true
          x-omitempty: true
          description: >-
            The settlement value of the YES/LONG side of the contract in cents.
            Only filled after determination
        settlement_value_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          x-omitempty: true
          description: >-
            The settlement value of the YES/LONG side of the contract in
            dollars. Only filled after determination
        settlement_ts:
          type: string
          format: date-time
          nullable: true
          x-omitempty: true
          description: >-
            Timestamp when the market was settled. Only filled for settled
            markets
        expiration_value:
          type: string
          description: The value that was considered for the settlement
        fee_waiver_expiration_time:
          type: string
          format: date-time
          nullable: true
          x-omitempty: true
          description: Time when this market's fee waiver expires
        early_close_condition:
          type: string
          nullable: true
          x-omitempty: true
          description: The condition under which the market can close early
          x-go-type-skip-optional-pointer: true
        tick_size:
          type: integer
          deprecated: true
          description: 'DEPRECATED: Use price_level_structure and price_ranges instead.'
        strike_type:
          type: string
          enum:
            - greater
            - greater_or_equal
            - less
            - less_or_equal
            - between
            - functional
            - custom
            - structured
          x-omitempty: true
          description: Strike type defines how the market strike is defined and evaluated
          x-go-type-skip-optional-pointer: true
        floor_strike:
          type: number
          format: double
          nullable: true
          x-omitempty: true
          description: Minimum expiration value that leads to a YES settlement
        cap_strike:
          type: number
          format: double
          nullable: true
          x-omitempty: true
          description: Maximum expiration value that leads to a YES settlement
        functional_strike:
          type: string
          nullable: true
          x-omitempty: true
          description: Mapping from expiration values to settlement values
        custom_strike:
          type: object
          nullable: true
          x-omitempty: true
          description: Expiration value for each target that leads to a YES settlement
        rules_primary:
          type: string
          description: A plain language description of the most important market terms
        rules_secondary:
          type: string
          description: A plain language description of secondary market terms
        mve_collection_ticker:
          type: string
          x-omitempty: true
          description: The ticker of the multivariate event collection
          x-go-type-skip-optional-pointer: true
        mve_selected_legs:
          type: array
          x-omitempty: true
          items:
            $ref: '#/components/schemas/MveSelectedLeg'
          x-go-type-skip-optional-pointer: true
        primary_participant_key:
          type: string
          nullable: true
          x-omitempty: true
        price_level_structure:
          type: string
          description: >-
            Price level structure for this market, defining price ranges and
            tick sizes
        price_ranges:
          type: array
          description: Valid price ranges for orders on this market
          items:
            $ref: '#/components/schemas/PriceRange'
        is_provisional:
          type: boolean
          x-omitempty: true
          description: >-
            If true, the market may be removed after determination if there is
            no activity on it
          x-go-type-skip-optional-pointer: true
    ErrorResponse:
      type: object
      properties:
        code:
          type: string
          description: Error code
        message:
          type: string
          description: Human-readable error message
        details:
          type: string
          description: Additional details about the error, if available
        service:
          type: string
          description: The name of the service that generated the error
    FixedPointDollars:
      type: string
      description: >-
        US dollar amount as a fixed-point decimal string with up to 4 decimal
        places of precision. This is the maximum supported precision; valid
        quote intervals for a given market are constrained by that market's
        price level structure.
      example: '0.5600'
    FixedPointCount:
      type: string
      description: >-
        Fixed-point contract count string (2 decimals, e.g., "10.00"; referred
        to as "fp" in field names). Requests accept 0–2 decimal places (e.g.,
        "10", "10.0", "10.00"); responses always emit 2 decimals. Currently only
        whole contract values are permitted, but the format supports future
        fractional precision. Integer contract count fields are legacy and will
        be deprecated; when both integer and fp fields are provided, they must
        match.
      example: '10.00'
    MveSelectedLeg:
      type: object
      properties:
        event_ticker:
          type: string
          description: Unique identifier for the selected event
          x-go-type-skip-optional-pointer: true
        market_ticker:
          type: string
          description: Unique identifier for the selected market
          x-go-type-skip-optional-pointer: true
        side:
          type: string
          description: The side of the selected market
          x-go-type-skip-optional-pointer: true
        yes_settlement_value_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          x-omitempty: true
          description: >-
            The settlement value of the YES/LONG side of the contract in
            dollars. Only filled after determination
    PriceRange:
      type: object
      required:
        - start
        - end
        - step
      properties:
        start:
          type: string
          description: Starting price for this range in dollars
        end:
          type: string
          description: Ending price for this range in dollars
        step:
          type: string
          description: Price step/tick size for this range in dollars
  responses:
    BadRequestError:
      description: Bad request - invalid input
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

````

### /api-reference/historical/get-historical-orders.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Historical Orders

>  Endpoint for getting orders that have been archived to the historical database.



## OpenAPI

````yaml openapi.yaml get /historical/orders
openapi: 3.0.0
info:
  title: Kalshi Trade API Manual Endpoints
  version: 3.8.0
  description: >-
    Manually defined OpenAPI spec for endpoints being migrated to spec-first
    approach
servers:
  - url: https://api.elections.kalshi.com/trade-api/v2
    description: Production server
security: []
tags:
  - name: api-keys
    description: API key management endpoints
  - name: orders
    description: Order management endpoints
  - name: order-groups
    description: Order group management endpoints
  - name: portfolio
    description: Portfolio and balance information endpoints
  - name: communications
    description: Request-for-quote (RFQ) endpoints
  - name: multivariate
    description: Multivariate event collection endpoints
  - name: exchange
    description: Exchange status and information endpoints
  - name: live-data
    description: Live data endpoints
  - name: markets
    description: Market data endpoints
  - name: milestone
    description: Milestone endpoints
  - name: search
    description: Search and filtering endpoints
  - name: incentive-programs
    description: Incentive program endpoints
  - name: fcm
    description: FCM member specific endpoints
  - name: events
    description: Event endpoints
  - name: structured-targets
    description: Structured targets endpoints
paths:
  /historical/orders:
    get:
      tags:
        - historical
      summary: Get Historical Orders
      description: ' Endpoint for getting orders that have been archived to the historical database.'
      operationId: GetHistoricalOrders
      parameters:
        - $ref: '#/components/parameters/TickerQuery'
        - $ref: '#/components/parameters/MaxTsQuery'
        - $ref: '#/components/parameters/LimitQuery'
        - $ref: '#/components/parameters/CursorQuery'
      responses:
        '200':
          description: Historical orders retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetOrdersResponse'
        '400':
          $ref: '#/components/responses/BadRequestError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '500':
          $ref: '#/components/responses/InternalServerError'
      security:
        - kalshiAccessKey: []
          kalshiAccessSignature: []
          kalshiAccessTimestamp: []
components:
  parameters:
    TickerQuery:
      name: ticker
      in: query
      description: Filter by market ticker
      schema:
        type: string
        x-go-type-skip-optional-pointer: true
    MaxTsQuery:
      name: max_ts
      in: query
      description: Filter items before this Unix timestamp
      schema:
        type: integer
        format: int64
    LimitQuery:
      name: limit
      in: query
      description: Number of results per page. Defaults to 100. Maximum value is 200.
      schema:
        type: integer
        format: int64
        minimum: 1
        maximum: 200
        default: 100
        x-oapi-codegen-extra-tags:
          validate: omitempty,min=1,max=200
    CursorQuery:
      name: cursor
      in: query
      description: >-
        Pagination cursor. Use the cursor value returned from the previous
        response to get the next page of results. Leave empty for the first
        page.
      schema:
        type: string
        x-go-type-skip-optional-pointer: true
  schemas:
    GetOrdersResponse:
      type: object
      required:
        - orders
        - cursor
      properties:
        orders:
          type: array
          items:
            $ref: '#/components/schemas/Order'
        cursor:
          type: string
    Order:
      type: object
      required:
        - order_id
        - user_id
        - client_order_id
        - ticker
        - side
        - action
        - type
        - status
        - yes_price
        - no_price
        - yes_price_dollars
        - no_price_dollars
        - fill_count
        - fill_count_fp
        - remaining_count
        - remaining_count_fp
        - initial_count
        - initial_count_fp
        - taker_fees
        - maker_fees
        - taker_fill_cost
        - maker_fill_cost
        - taker_fill_cost_dollars
        - maker_fill_cost_dollars
        - queue_position
      properties:
        order_id:
          type: string
        user_id:
          type: string
          description: Unique identifier for users
        client_order_id:
          type: string
        ticker:
          type: string
        side:
          type: string
          enum:
            - 'yes'
            - 'no'
        action:
          type: string
          enum:
            - buy
            - sell
        type:
          type: string
          enum:
            - limit
            - market
        status:
          $ref: '#/components/schemas/OrderStatus'
        yes_price:
          type: integer
        no_price:
          type: integer
        yes_price_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: The yes price for this order in fixed-point dollars
        no_price_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: The no price for this order in fixed-point dollars
        fill_count:
          type: integer
          description: The number of contracts that have been filled
        fill_count_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            String representation of the number of contracts that have been
            filled
        remaining_count:
          type: integer
        remaining_count_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: String representation of the remaining contracts for this order
        initial_count:
          type: integer
          description: The initial size of the order (contract units)
        initial_count_fp:
          $ref: '#/components/schemas/FixedPointCount'
          description: >-
            String representation of the initial size of the order (contract
            units)
        taker_fees:
          type: integer
          description: Fees paid on filled taker contracts, in cents
        maker_fees:
          type: integer
          description: Fees paid on filled maker contracts, in cents
        taker_fill_cost:
          type: integer
          description: The cost of filled taker orders in cents
        maker_fill_cost:
          type: integer
          description: The cost of filled maker orders in cents
        taker_fill_cost_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: The cost of filled taker orders in dollars
        maker_fill_cost_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          description: The cost of filled maker orders in dollars
        queue_position:
          type: integer
          description: >-
            **DEPRECATED**: This field is deprecated and will always return 0.
            Please use the GET /portfolio/orders/{order_id}/queue_position
            endpoint instead
        taker_fees_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          description: Fees paid on filled taker contracts, in dollars
        maker_fees_dollars:
          $ref: '#/components/schemas/FixedPointDollars'
          nullable: true
          description: Fees paid on filled maker contracts, in dollars
        expiration_time:
          type: string
          format: date-time
          nullable: true
        created_time:
          type: string
          format: date-time
          nullable: true
          x-omitempty: false
        last_update_time:
          type: string
          format: date-time
          nullable: true
          x-omitempty: true
          description: The last update to an order (modify, cancel, fill)
        self_trade_prevention_type:
          $ref: '#/components/schemas/SelfTradePreventionType'
          nullable: true
          x-omitempty: false
        order_group_id:
          type: string
          nullable: true
          description: The order group this order is part of
        cancel_order_on_pause:
          type: boolean
          description: >-
            If this flag is set to true, the order will be canceled if the order
            is open and trading on the exchange is paused for any reason.
        subaccount_number:
          type: integer
          nullable: true
          x-omitempty: true
          description: Subaccount number (0 for primary, 1-32 for subaccounts).
    ErrorResponse:
      type: object
      properties:
        code:
          type: string
          description: Error code
        message:
          type: string
          description: Human-readable error message
        details:
          type: string
          description: Additional details about the error, if available
        service:
          type: string
          description: The name of the service that generated the error
    OrderStatus:
      type: string
      enum:
        - resting
        - canceled
        - executed
      description: The status of an order
    FixedPointDollars:
      type: string
      description: >-
        US dollar amount as a fixed-point decimal string with up to 4 decimal
        places of precision. This is the maximum supported precision; valid
        quote intervals for a given market are constrained by that market's
        price level structure.
      example: '0.5600'
    FixedPointCount:
      type: string
      description: >-
        Fixed-point contract count string (2 decimals, e.g., "10.00"; referred
        to as "fp" in field names). Requests accept 0–2 decimal places (e.g.,
        "10", "10.0", "10.00"); responses always emit 2 decimals. Currently only
        whole contract values are permitted, but the format supports future
        fractional precision. Integer contract count fields are legacy and will
        be deprecated; when both integer and fp fields are provided, they must
        match.
      example: '10.00'
    SelfTradePreventionType:
      type: string
      enum:
        - taker_at_cross
        - maker
      description: The self-trade prevention type for orders
  responses:
    BadRequestError:
      description: Bad request - invalid input
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    UnauthorizedError:
      description: Unauthorized - authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
  securitySchemes:
    kalshiAccessKey:
      type: apiKey
      in: header
      name: KALSHI-ACCESS-KEY
      description: Your API key ID
    kalshiAccessSignature:
      type: apiKey
      in: header
      name: KALSHI-ACCESS-SIGNATURE
      description: RSA-PSS signature of the request
    kalshiAccessTimestamp:
      type: apiKey
      in: header
      name: KALSHI-ACCESS-TIMESTAMP
      description: Request timestamp in milliseconds

````

### WebSockets

+----+-----------------------------------------+
| No | Page                                    |
+----+-----------------------------------------+
| 1  | /websockets/websocket-connection.md     |
| 2  | /websockets/communications.md           |
| 3  | /websockets/connection-keep-alive.md    |
| 4  | /websockets/market-&-event-lifecycle.md |
| 5  | /websockets/market-positions.md         |
| 6  | /websockets/market-ticker.md            |
| 7  | /websockets/multivariate-lookups.md     |
| 8  | /websockets/order-group-updates.md      |
| 9  | /websockets/orderbook-updates.md        |
| 10 | /websockets/public-trades.md            |
| 11 | /websockets/user-fills.md               |
| 12 | /websockets/user-orders.md              |
+----+-----------------------------------------+

### /websockets/websocket-connection.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# WebSocket Connection

> Main WebSocket connection endpoint. All communication happens through this single connection.
Authentication is required to establish the connection; include API key headers during the WebSocket handshake.
Some channels carry only public market data, but the connection itself still requires authentication.
Use the subscribe command to subscribe to specific data channels. For more information, see the [Getting Started](https://docs.kalshi.com/getting_started/quick_start_websockets) guide.




## AsyncAPI

````yaml asyncapi.yaml root
id: root
title: WebSocket Connection
description: >
  Main WebSocket connection endpoint. All communication happens through this
  single connection.

  Authentication is required to establish the connection; include API key
  headers during the WebSocket handshake.

  Some channels carry only public market data, but the connection itself still
  requires authentication.

  Use the subscribe command to subscribe to specific data channels. For more
  information, see the [Getting
  Started](https://docs.kalshi.com/getting_started/quick_start_websockets)
  guide.
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: /
parameters: []
bindings:
  - protocol: ws
    version: latest
    value:
      method: GET
    schemaProperties:
      - name: method
        type: string
        description: GET
        required: false
operations:
  - &ref_7
    id: sendSubscribe
    title: Subscribe to Channels
    description: Subscribe to one or more market data channels
    type: receive
    messages:
      - &ref_18
        id: subscribeCommand
        contentType: application/json
        payload:
          - name: Subscribe Command
            description: Subscribe to one or more channels
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: true
              - name: cmd
                type: string
                description: subscribe
                required: true
              - name: params
                type: object
                required: true
                properties:
                  - name: channels
                    type: array
                    description: List of channels to subscribe to
                    required: false
                  - name: market_ticker
                    type: string
                    description: >-
                      Subscribe to a single market. Type: string. Example:
                      "KXBTCD-25AUG0517-T114999.99" (mutually exclusive with
                      market_tickers)
                    required: false
                  - name: market_tickers
                    type: array
                    description: >-
                      Subscribe to multiple markets. Type: array of strings.
                      Example: ["KXBTCD-25AUG0517-T114999.99",
                      "KXETHD-25AUG0517-T3749.99"] (mutually exclusive with
                      market_ticker)
                    required: false
                  - name: market_id
                    type: string
                    description: >-
                      Subscribe to a single market by UUID (ticker only;
                      mutually exclusive with market_ids and market_ticker(s))
                    required: false
                  - name: market_ids
                    type: array
                    description: >-
                      Subscribe to multiple markets by UUID (ticker only;
                      mutually exclusive with market_id and market_ticker(s))
                    required: false
                  - name: send_initial_snapshot
                    type: boolean
                    description: >-
                      If true, receive an initial snapshot for requested market
                      tickers on the ticker channel
                    required: false
                  - name: skip_ticker_ack
                    type: boolean
                    description: >-
                      If true, OK responses omit the market_tickers/market_ids
                      lists for this subscription
                    required: false
                  - name: shard_factor
                    type: integer
                    description: >-
                      Number of shards for communications channel fanout
                      (optional)
                    required: false
                  - name: shard_key
                    type: integer
                    description: >-
                      Shard key for communications channel fanout (requires
                      shard_factor)
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - id
            - cmd
            - params
          properties:
            id: &ref_0
              type: integer
              description: >
                Unique ID of the command request. Generated by the client and
                should be unique within a WS session.

                The simplest way to use it would be to start from 1 and then
                increment the value for every new command sent to the server.

                If the id is set to 0, the server treats it the same way as if
                there was no id.
              minimum: 0
              x-parser-schema-id: commandId
            cmd:
              type: string
              const: subscribe
              x-parser-schema-id: <anonymous-schema-1>
            params:
              type: object
              required:
                - channels
              properties:
                channels:
                  type: array
                  description: List of channels to subscribe to
                  items:
                    type: string
                    enum:
                      - orderbook_delta
                      - ticker
                      - trade
                      - fill
                      - market_positions
                      - market_lifecycle_v2
                      - multivariate
                      - communications
                      - order_group_updates
                      - user_orders
                    x-parser-schema-id: <anonymous-schema-4>
                  minItems: 1
                  x-parser-schema-id: <anonymous-schema-3>
                market_ticker:
                  description: >-
                    Subscribe to a single market. Type: string. Example:
                    "KXBTCD-25AUG0517-T114999.99" (mutually exclusive with
                    market_tickers)
                  type: string
                  x-parser-schema-id: <anonymous-schema-5>
                market_tickers:
                  type: array
                  description: >-
                    Subscribe to multiple markets. Type: array of strings.
                    Example: ["KXBTCD-25AUG0517-T114999.99",
                    "KXETHD-25AUG0517-T3749.99"] (mutually exclusive with
                    market_ticker)
                  items: &ref_3
                    type: string
                    description: Unique market identifier
                    pattern: ^[A-Z0-9-]+$
                    examples:
                      - FED-23DEC-T3.00
                      - HIGHNY-22DEC23-B53.5
                    x-parser-schema-id: marketTicker
                  minItems: 1
                  x-parser-schema-id: <anonymous-schema-6>
                market_id:
                  type: string
                  format: uuid
                  description: >-
                    Subscribe to a single market by UUID (ticker only; mutually
                    exclusive with market_ids and market_ticker(s))
                  x-parser-schema-id: <anonymous-schema-7>
                market_ids:
                  type: array
                  description: >-
                    Subscribe to multiple markets by UUID (ticker only; mutually
                    exclusive with market_id and market_ticker(s))
                  items: &ref_4
                    type: string
                    description: Unique market UUID
                    format: uuid
                    x-parser-schema-id: marketId
                  minItems: 1
                  x-parser-schema-id: <anonymous-schema-8>
                send_initial_snapshot:
                  type: boolean
                  description: >-
                    If true, receive an initial snapshot for requested market
                    tickers on the ticker channel
                  default: false
                  x-parser-schema-id: <anonymous-schema-9>
                skip_ticker_ack:
                  type: boolean
                  description: >-
                    If true, OK responses omit the market_tickers/market_ids
                    lists for this subscription
                  default: false
                  x-parser-schema-id: <anonymous-schema-10>
                shard_factor:
                  type: integer
                  description: >-
                    Number of shards for communications channel fanout
                    (optional)
                  minimum: 1
                  x-parser-schema-id: <anonymous-schema-11>
                shard_key:
                  type: integer
                  description: >-
                    Shard key for communications channel fanout (requires
                    shard_factor)
                  minimum: 0
                  x-parser-schema-id: <anonymous-schema-12>
              x-parser-schema-id: <anonymous-schema-2>
          x-parser-schema-id: subscribeCommandPayload
        title: Subscribe Command
        description: Subscribe to one or more channels
        example: |-
          {
            "id": 1,
            "cmd": "subscribe",
            "params": {
              "channels": [
                "orderbook_delta"
              ],
              "market_ticker": "CPI-22DEC-TN0.1"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: subscribeCommand
    bindings: []
    extensions: &ref_1
      - id: x-parser-unique-object-id
        value: root
  - &ref_8
    id: sendUnsubscribe
    title: Unsubscribe from Channels
    description: Cancel one or more active subscriptions
    type: receive
    messages:
      - &ref_19
        id: unsubscribeCommand
        contentType: application/json
        payload:
          - name: Unsubscribe Command
            description: Cancel one or more subscriptions
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: true
              - name: cmd
                type: string
                description: unsubscribe
                required: true
              - name: params
                type: object
                required: true
                properties:
                  - name: sids
                    type: array
                    description: List of subscription IDs to cancel
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - id
            - cmd
            - params
          properties:
            id: *ref_0
            cmd:
              type: string
              const: unsubscribe
              x-parser-schema-id: <anonymous-schema-13>
            params:
              type: object
              required:
                - sids
              properties:
                sids:
                  type: array
                  description: List of subscription IDs to cancel
                  items: &ref_2
                    type: integer
                    description: >-
                      Server-generated subscription identifier (sid) used to
                      identify the channel
                    minimum: 1
                    x-parser-schema-id: subscriptionId
                  minItems: 1
                  x-parser-schema-id: <anonymous-schema-15>
              x-parser-schema-id: <anonymous-schema-14>
          x-parser-schema-id: unsubscribeCommandPayload
        title: Unsubscribe Command
        description: Cancel one or more subscriptions
        example: |-
          {
            "id": 124,
            "cmd": "unsubscribe",
            "params": {
              "sids": [
                1,
                2
              ]
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: unsubscribeCommand
    bindings: []
    extensions: *ref_1
  - &ref_9
    id: sendListSubscriptions
    title: List Subscriptions
    description: List all active subscriptions
    type: receive
    messages:
      - &ref_20
        id: listSubscriptionsCommand
        contentType: application/json
        payload:
          - name: List Subscriptions Command
            description: List all active subscriptions
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: true
              - name: cmd
                type: string
                description: list_subscriptions
                required: true
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - id
            - cmd
          properties:
            id: *ref_0
            cmd:
              type: string
              const: list_subscriptions
              x-parser-schema-id: <anonymous-schema-25>
          x-parser-schema-id: listSubscriptionsCommandPayload
        title: List Subscriptions Command
        description: List all active subscriptions
        example: |-
          {
            "id": 3,
            "cmd": "list_subscriptions"
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: listSubscriptionsCommand
    bindings: []
    extensions: *ref_1
  - &ref_10
    id: sendUpdateSubscription
    title: Update Subscription - Add Markets
    description: Add markets to an existing subscription
    type: receive
    messages:
      - &ref_21
        id: updateSubscriptionCommand
        contentType: application/json
        payload:
          - name: Update Subscription - Add Markets
            description: Add markets to an existing subscription
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: true
              - name: cmd
                type: string
                description: update_subscription
                required: true
              - name: params
                type: object
                required: true
                properties:
                  - name: sid
                    type: integer
                    description: >-
                      Server-generated subscription identifier (sid) used to
                      identify the channel
                    required: false
                  - name: sids
                    type: array
                    description: >-
                      Array containing exactly one subscription ID (alternative
                      to sid). Either sid or sids must be provided, not both.
                    required: false
                  - name: market_ticker
                    type: string
                    description: 'Add/remove a single market. Type: string'
                    required: false
                  - name: market_tickers
                    type: array
                    description: 'Add/remove multiple markets. Type: array of strings'
                    required: false
                  - name: market_id
                    type: string
                    description: Add/remove a single market by UUID (ticker only)
                    required: false
                  - name: market_ids
                    type: array
                    description: Add/remove multiple markets by UUID (ticker only)
                    required: false
                  - name: send_initial_snapshot
                    type: boolean
                    description: >-
                      If true, receive an initial snapshot for newly added
                      market tickers on the ticker channel
                    required: false
                  - name: action
                    type: string
                    required: false
        headers: []
        jsonPayloadSchema: &ref_5
          type: object
          required:
            - id
            - cmd
            - params
          properties:
            id: *ref_0
            cmd:
              type: string
              const: update_subscription
              x-parser-schema-id: <anonymous-schema-16>
            params:
              type: object
              required:
                - action
              properties:
                sid: *ref_2
                sids:
                  type: array
                  description: >-
                    Array containing exactly one subscription ID (alternative to
                    sid). Either sid or sids must be provided, not both.
                  items: *ref_2
                  minItems: 1
                  maxItems: 1
                  x-parser-schema-id: <anonymous-schema-18>
                market_ticker:
                  description: 'Add/remove a single market. Type: string'
                  type: string
                  x-parser-schema-id: <anonymous-schema-19>
                market_tickers:
                  type: array
                  description: 'Add/remove multiple markets. Type: array of strings'
                  items: *ref_3
                  x-parser-schema-id: <anonymous-schema-20>
                market_id:
                  type: string
                  format: uuid
                  description: Add/remove a single market by UUID (ticker only)
                  x-parser-schema-id: <anonymous-schema-21>
                market_ids:
                  type: array
                  description: Add/remove multiple markets by UUID (ticker only)
                  items: *ref_4
                  x-parser-schema-id: <anonymous-schema-22>
                send_initial_snapshot:
                  type: boolean
                  description: >-
                    If true, receive an initial snapshot for newly added market
                    tickers on the ticker channel
                  default: false
                  x-parser-schema-id: <anonymous-schema-23>
                action:
                  type: string
                  enum:
                    - add_markets
                    - delete_markets
                  x-parser-schema-id: <anonymous-schema-24>
              x-parser-schema-id: <anonymous-schema-17>
          x-parser-schema-id: updateSubscriptionCommandPayload
        title: Update Subscription - Add Markets
        description: Add markets to an existing subscription
        example: |-
          {
            "id": 124,
            "cmd": "update_subscription",
            "params": {
              "sids": [
                456
              ],
              "market_tickers": [
                "NEW-MARKET-1",
                "NEW-MARKET-2"
              ],
              "action": "add_markets"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: updateSubscriptionCommand
    bindings: []
    extensions: *ref_1
  - &ref_11
    id: sendUpdateSubscriptionDelete
    title: Update Subscription - Delete Markets
    description: Remove markets from an existing subscription
    type: receive
    messages:
      - &ref_22
        id: updateSubscriptionDeleteCommand
        contentType: application/json
        payload:
          - name: Update Subscription - Delete Markets
            description: Remove markets from an existing subscription
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: true
              - name: cmd
                type: string
                description: update_subscription
                required: true
              - name: params
                type: object
                required: true
                properties:
                  - name: sid
                    type: integer
                    description: >-
                      Server-generated subscription identifier (sid) used to
                      identify the channel
                    required: false
                  - name: sids
                    type: array
                    description: >-
                      Array containing exactly one subscription ID (alternative
                      to sid). Either sid or sids must be provided, not both.
                    required: false
                  - name: market_ticker
                    type: string
                    description: 'Add/remove a single market. Type: string'
                    required: false
                  - name: market_tickers
                    type: array
                    description: 'Add/remove multiple markets. Type: array of strings'
                    required: false
                  - name: market_id
                    type: string
                    description: Add/remove a single market by UUID (ticker only)
                    required: false
                  - name: market_ids
                    type: array
                    description: Add/remove multiple markets by UUID (ticker only)
                    required: false
                  - name: send_initial_snapshot
                    type: boolean
                    description: >-
                      If true, receive an initial snapshot for newly added
                      market tickers on the ticker channel
                    required: false
                  - name: action
                    type: string
                    required: false
        headers: []
        jsonPayloadSchema: *ref_5
        title: Update Subscription - Delete Markets
        description: Remove markets from an existing subscription
        example: |-
          {
            "id": 125,
            "cmd": "update_subscription",
            "params": {
              "sids": [
                456
              ],
              "market_tickers": [
                "MARKET-TO-REMOVE-1",
                "MARKET-TO-REMOVE-2"
              ],
              "action": "delete_markets"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: updateSubscriptionDeleteCommand
    bindings: []
    extensions: *ref_1
  - &ref_12
    id: sendUpdateSubscriptionSingleSid
    title: Update Subscription - Single SID
    description: Update subscription using single sid parameter
    type: receive
    messages:
      - &ref_23
        id: updateSubscriptionSingleSidCommand
        contentType: application/json
        payload:
          - name: Update Subscription - Single SID Format
            description: Update subscription using sid parameter instead of sids array
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: true
              - name: cmd
                type: string
                description: update_subscription
                required: true
              - name: params
                type: object
                required: true
                properties:
                  - name: sid
                    type: integer
                    description: >-
                      Server-generated subscription identifier (sid) used to
                      identify the channel
                    required: false
                  - name: sids
                    type: array
                    description: >-
                      Array containing exactly one subscription ID (alternative
                      to sid). Either sid or sids must be provided, not both.
                    required: false
                  - name: market_ticker
                    type: string
                    description: 'Add/remove a single market. Type: string'
                    required: false
                  - name: market_tickers
                    type: array
                    description: 'Add/remove multiple markets. Type: array of strings'
                    required: false
                  - name: market_id
                    type: string
                    description: Add/remove a single market by UUID (ticker only)
                    required: false
                  - name: market_ids
                    type: array
                    description: Add/remove multiple markets by UUID (ticker only)
                    required: false
                  - name: send_initial_snapshot
                    type: boolean
                    description: >-
                      If true, receive an initial snapshot for newly added
                      market tickers on the ticker channel
                    required: false
                  - name: action
                    type: string
                    required: false
        headers: []
        jsonPayloadSchema: *ref_5
        title: Update Subscription - Single SID Format
        description: Update subscription using sid parameter instead of sids array
        example: |-
          {
            "id": 126,
            "cmd": "update_subscription",
            "params": {
              "sid": 456,
              "market_tickers": [
                "NEW-MARKET-3",
                "NEW-MARKET-4"
              ],
              "action": "add_markets"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: updateSubscriptionSingleSidCommand
    bindings: []
    extensions: *ref_1
  - &ref_13
    id: receiveSubscribed
    title: Subscription Confirmed
    description: Receive confirmation that subscription was successful
    type: send
    messages:
      - &ref_24
        id: subscribedResponse
        contentType: application/json
        payload:
          - name: Subscribed Response
            description: Confirmation that subscription was successful
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: false
              - name: type
                type: string
                description: subscribed
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: channel
                    type: string
                    required: false
                  - name: sid
                    type: integer
                    description: >-
                      Server-generated subscription identifier (sid) used to
                      identify the channel
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - msg
          properties:
            id: *ref_0
            type:
              type: string
              const: subscribed
              x-parser-schema-id: <anonymous-schema-26>
            msg:
              type: object
              required:
                - channel
                - sid
              properties:
                channel:
                  type: string
                  x-parser-schema-id: <anonymous-schema-28>
                sid: *ref_2
              x-parser-schema-id: <anonymous-schema-27>
          x-parser-schema-id: subscribedResponsePayload
        title: Subscribed Response
        description: Confirmation that subscription was successful
        example: |-
          {
            "id": 1,
            "type": "subscribed",
            "msg": {
              "channel": "orderbook_delta",
              "sid": 1
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: subscribedResponse
    bindings: []
    extensions: *ref_1
  - &ref_14
    id: receiveUnsubscribed
    title: Unsubscription Confirmed
    description: Receive confirmation that unsubscription was successful
    type: send
    messages:
      - &ref_25
        id: unsubscribedResponse
        contentType: application/json
        payload:
          - name: Unsubscribed Response
            description: Confirmation that unsubscription was successful
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: false
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: seq
                type: integer
                description: >-
                  Sequential number that should be checked if you want to
                  guarantee you received all the messages. Used for
                  snapshot/delta consistency
                required: true
              - name: type
                type: string
                description: unsubscribed
                required: true
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - sid
            - seq
            - type
          properties:
            id: *ref_0
            sid: *ref_2
            seq: &ref_6
              type: integer
              description: >-
                Sequential number that should be checked if you want to
                guarantee you received all the messages. Used for snapshot/delta
                consistency
              minimum: 1
              x-parser-schema-id: sequenceNumber
            type:
              type: string
              const: unsubscribed
              x-parser-schema-id: <anonymous-schema-33>
          x-parser-schema-id: unsubscribedResponsePayload
        title: Unsubscribed Response
        description: Confirmation that unsubscription was successful
        example: |-
          {
            "id": 102,
            "sid": 2,
            "seq": 7,
            "type": "unsubscribed"
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: unsubscribedResponse
    bindings: []
    extensions: *ref_1
  - &ref_15
    id: receiveOk
    title: Update Confirmed
    description: Receive confirmation that subscription update was successful
    type: send
    messages:
      - &ref_26
        id: okResponse
        contentType: application/json
        payload:
          - name: OK Response
            description: Successful update operation response
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: false
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: false
              - name: seq
                type: integer
                description: >-
                  Sequential number that should be checked if you want to
                  guarantee you received all the messages. Used for
                  snapshot/delta consistency
                required: false
              - name: type
                type: string
                description: ok
                required: true
              - name: msg
                type: object
                required: false
                properties:
                  - name: market_tickers
                    type: array
                    description: Full list of market tickers after update
                    required: false
                  - name: market_ids
                    type: array
                    description: Full list of market IDs after update
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
          properties:
            id: *ref_0
            sid: *ref_2
            seq: *ref_6
            type:
              type: string
              const: ok
              x-parser-schema-id: <anonymous-schema-34>
            msg:
              type: object
              properties:
                market_tickers:
                  type: array
                  description: Full list of market tickers after update
                  items: *ref_3
                  x-parser-schema-id: <anonymous-schema-36>
                market_ids:
                  type: array
                  description: Full list of market IDs after update
                  items: *ref_4
                  x-parser-schema-id: <anonymous-schema-37>
              x-parser-schema-id: <anonymous-schema-35>
          x-parser-schema-id: okResponsePayload
        title: OK Response
        description: Successful update operation response
        example: |-
          {
            "id": 123,
            "sid": 456,
            "seq": 222,
            "type": "ok",
            "msg": {
              "market_tickers": [
                "MARKET-1",
                "MARKET-2",
                "MARKET-3"
              ]
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: okResponse
    bindings: []
    extensions: *ref_1
  - &ref_16
    id: receiveListSubscriptions
    title: List Subscriptions Response
    description: Receive list of all active subscriptions
    type: send
    messages:
      - &ref_27
        id: listSubscriptionsResponse
        contentType: application/json
        payload:
          - name: List Subscriptions Response
            description: Response containing all active subscriptions
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: true
              - name: type
                type: string
                description: ok
                required: true
              - name: msg
                type: array
                description: List of active subscriptions
                required: true
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - id
            - type
            - msg
          properties:
            id: *ref_0
            type:
              type: string
              const: ok
              x-parser-schema-id: <anonymous-schema-29>
            msg:
              type: array
              description: List of active subscriptions
              items:
                type: object
                required:
                  - channel
                  - sid
                properties:
                  channel:
                    type: string
                    description: Name of the subscribed channel
                    x-parser-schema-id: <anonymous-schema-32>
                  sid: *ref_2
                x-parser-schema-id: <anonymous-schema-31>
              x-parser-schema-id: <anonymous-schema-30>
          x-parser-schema-id: listSubscriptionsResponsePayload
        title: List Subscriptions Response
        description: Response containing all active subscriptions
        example: |-
          {
            "id": 3,
            "type": "ok",
            "msg": [
              {
                "channel": "orderbook_delta",
                "sid": 1
              },
              {
                "channel": "ticker",
                "sid": 2
              },
              {
                "channel": "fill",
                "sid": 3
              }
            ]
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: listSubscriptionsResponse
    bindings: []
    extensions: *ref_1
  - &ref_17
    id: receiveError
    title: Error Response
    description: Receive error message when a command fails
    type: send
    messages:
      - &ref_28
        id: errorResponse
        contentType: application/json
        payload:
          - name: Error Response
            description: Error response for failed operations
            type: object
            properties:
              - name: id
                type: integer
                description: >
                  Unique ID of the command request. Generated by the client and
                  should be unique within a WS session.

                  The simplest way to use it would be to start from 1 and then
                  increment the value for every new command sent to the server.

                  If the id is set to 0, the server treats it the same way as if
                  there was no id.
                required: false
              - name: type
                type: string
                description: error
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: code
                    type: integer
                    description: >
                      Error code identifying the type of error:

                      - 1: Unable to process message - General processing error

                      - 2: Params required - Missing params object in command

                      - 3: Channels required - Missing channels array in
                      subscribe

                      - 4: Subscription IDs required - Missing sids in
                      unsubscribe

                      - 5: Unknown command - Invalid command name

                      - 6: Already subscribed - Duplicate subscription attempt

                      - 7: Unknown subscription ID - Subscription ID not found

                      - 8: Unknown channel name - Invalid channel in subscribe

                      - 9: Authentication required - Channel requires
                      authenticated connection

                      - 10: Channel error - Channel-specific error

                      - 11: Invalid parameter - Malformed parameter value

                      - 12: Exactly one subscription ID is required - For
                      update_subscription

                      - 13: Unsupported action - Invalid action for
                      update_subscription

                      - 14: Market Ticker required - Missing market
                      specification (market_ticker or market_id)

                      - 15: Action required - Missing action in
                      update_subscription

                      - 16: Market not found - Invalid market_ticker or
                      market_id

                      - 17: Internal error - Server-side processing error

                      - 18: Command timeout - Server timed out while processing
                      command

                      - 19: shard_factor must be > 0 - Invalid shard_factor

                      - 20: shard_factor is required when shard_key is set -
                      Missing shard_factor when shard_key is set

                      - 21: shard_key must be >= 0 and < shard_factor - Invalid
                      shard_key

                      - 22: shard_factor must be <= 100 - shard_factor too large
                    required: false
                  - name: msg
                    type: string
                    description: Human-readable error message
                    required: false
                  - name: market_id
                    type: string
                    description: Market UUID if error is market-specific (optional)
                    required: false
                  - name: market_ticker
                    type: string
                    description: Market ticker if error is market-specific (optional)
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - msg
          properties:
            id: *ref_0
            type:
              type: string
              const: error
              x-parser-schema-id: <anonymous-schema-38>
            msg:
              type: object
              required:
                - code
                - msg
              properties:
                code:
                  type: integer
                  description: >
                    Error code identifying the type of error:

                    - 1: Unable to process message - General processing error

                    - 2: Params required - Missing params object in command

                    - 3: Channels required - Missing channels array in subscribe

                    - 4: Subscription IDs required - Missing sids in unsubscribe

                    - 5: Unknown command - Invalid command name

                    - 6: Already subscribed - Duplicate subscription attempt

                    - 7: Unknown subscription ID - Subscription ID not found

                    - 8: Unknown channel name - Invalid channel in subscribe

                    - 9: Authentication required - Channel requires
                    authenticated connection

                    - 10: Channel error - Channel-specific error

                    - 11: Invalid parameter - Malformed parameter value

                    - 12: Exactly one subscription ID is required - For
                    update_subscription

                    - 13: Unsupported action - Invalid action for
                    update_subscription

                    - 14: Market Ticker required - Missing market specification
                    (market_ticker or market_id)

                    - 15: Action required - Missing action in
                    update_subscription

                    - 16: Market not found - Invalid market_ticker or market_id

                    - 17: Internal error - Server-side processing error

                    - 18: Command timeout - Server timed out while processing
                    command

                    - 19: shard_factor must be > 0 - Invalid shard_factor

                    - 20: shard_factor is required when shard_key is set -
                    Missing shard_factor when shard_key is set

                    - 21: shard_key must be >= 0 and < shard_factor - Invalid
                    shard_key

                    - 22: shard_factor must be <= 100 - shard_factor too large
                  minimum: 1
                  maximum: 22
                  x-parser-schema-id: <anonymous-schema-40>
                msg:
                  type: string
                  description: Human-readable error message
                  x-parser-schema-id: <anonymous-schema-41>
                market_id:
                  type: string
                  description: Market UUID if error is market-specific (optional)
                  x-parser-schema-id: <anonymous-schema-42>
                market_ticker:
                  type: string
                  description: Market ticker if error is market-specific (optional)
                  x-parser-schema-id: <anonymous-schema-43>
              x-parser-schema-id: <anonymous-schema-39>
          x-parser-schema-id: errorResponsePayload
        title: Error Response
        description: Error response for failed operations
        example: |-
          {
            "id": 123,
            "type": "error",
            "msg": {
              "code": 6,
              "msg": "Already subscribed"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: errorResponse
    bindings: []
    extensions: *ref_1
sendOperations:
  - *ref_7
  - *ref_8
  - *ref_9
  - *ref_10
  - *ref_11
  - *ref_12
receiveOperations:
  - *ref_13
  - *ref_14
  - *ref_15
  - *ref_16
  - *ref_17
sendMessages:
  - *ref_18
  - *ref_19
  - *ref_20
  - *ref_21
  - *ref_22
  - *ref_23
receiveMessages:
  - *ref_24
  - *ref_25
  - *ref_26
  - *ref_27
  - *ref_28
extensions:
  - id: x-parser-unique-object-id
    value: root
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/communications.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Communications

> Real-time Request for Quote (RFQ) and quote notifications. Requires authentication.

**Requirements:**
- Authentication required
- Market specification ignored
- Optional sharding for fanout control:
  - `shard_factor` (1-100) and `shard_key` (0 <= key < shard_factor)
- RFQ events (RFQCreated, RFQDeleted) always sent
- Quote events (QuoteCreated, QuoteAccepted, QuoteExecuted) are only sent if you created the quote OR you created the RFQ

**Use case:** Tracking RFQs you create and quotes on your RFQs, or quotes you create on others' RFQs. Use QuoteExecuted to correlate fill messages with quotes via client_order_id.




## AsyncAPI

````yaml asyncapi.yaml communications
id: communications
title: Communications
description: >
  Real-time Request for Quote (RFQ) and quote notifications. Requires
  authentication.


  **Requirements:**

  - Authentication required

  - Market specification ignored

  - Optional sharding for fanout control:
    - `shard_factor` (1-100) and `shard_key` (0 <= key < shard_factor)
  - RFQ events (RFQCreated, RFQDeleted) always sent

  - Quote events (QuoteCreated, QuoteAccepted, QuoteExecuted) are only sent if
  you created the quote OR you created the RFQ


  **Use case:** Tracking RFQs you create and quotes on your RFQs, or quotes you
  create on others' RFQs. Use QuoteExecuted to correlate fill messages with
  quotes via client_order_id.
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: communications
parameters: []
bindings: []
operations:
  - &ref_2
    id: receiveRFQCreated
    title: RFQ Created
    description: Receive RFQ created notifications
    type: send
    messages:
      - &ref_7
        id: rfqCreated
        contentType: application/json
        payload:
          - name: RFQ Created
            description: Notification when an RFQ is created
            type: object
            properties:
              - name: type
                type: string
                description: rfq_created
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: id
                    type: string
                    description: Unique identifier for the RFQ
                    required: false
                  - name: creator_id
                    type: string
                    description: >-
                      Public communications ID of the RFQ creator (anonymized).
                      Currently empty for rfq_created events.
                    required: false
                  - name: market_ticker
                    type: string
                    description: Market ticker for the RFQ
                    required: false
                  - name: event_ticker
                    type: string
                    description: Event ticker (optional)
                    required: false
                  - name: contracts
                    type: integer
                    description: Number of contracts requested (optional)
                    required: false
                  - name: contracts_fp
                    type: string
                    description: Fixed-point contracts requested (2 decimals) (optional)
                    required: false
                  - name: target_cost
                    type: integer
                    description: Target cost in centicents (optional)
                    required: false
                  - name: target_cost_dollars
                    type: string
                    description: Target cost in dollars (optional)
                    required: false
                  - name: created_ts
                    type: string
                    description: Timestamp when the RFQ was created
                    required: false
                  - name: mve_collection_ticker
                    type: string
                    description: Multivariate event collection ticker (optional)
                    required: false
                  - name: mve_selected_legs
                    type: array
                    description: Selected legs for multivariate events (optional)
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: rfq_created
              x-parser-schema-id: <anonymous-schema-176>
            sid: &ref_0
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            msg:
              type: object
              required:
                - id
                - creator_id
                - market_ticker
                - created_ts
              properties:
                id:
                  type: string
                  description: Unique identifier for the RFQ
                  x-parser-schema-id: <anonymous-schema-178>
                creator_id:
                  type: string
                  description: >-
                    Public communications ID of the RFQ creator (anonymized).
                    Currently empty for rfq_created events.
                  x-parser-schema-id: <anonymous-schema-179>
                market_ticker:
                  type: string
                  description: Market ticker for the RFQ
                  x-parser-schema-id: <anonymous-schema-180>
                event_ticker:
                  type: string
                  description: Event ticker (optional)
                  x-parser-schema-id: <anonymous-schema-181>
                contracts:
                  type: integer
                  description: Number of contracts requested (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-182>
                contracts_fp:
                  type: string
                  description: Fixed-point contracts requested (2 decimals) (optional)
                  x-parser-schema-id: <anonymous-schema-183>
                target_cost:
                  type: integer
                  description: Target cost in centicents (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-184>
                target_cost_dollars:
                  type: string
                  description: Target cost in dollars (optional)
                  x-parser-schema-id: <anonymous-schema-185>
                created_ts:
                  type: string
                  description: Timestamp when the RFQ was created
                  format: date-time
                  x-parser-schema-id: <anonymous-schema-186>
                mve_collection_ticker:
                  type: string
                  description: Multivariate event collection ticker (optional)
                  x-parser-schema-id: <anonymous-schema-187>
                mve_selected_legs:
                  type: array
                  description: Selected legs for multivariate events (optional)
                  items:
                    type: object
                    properties:
                      event_ticker:
                        type: string
                        x-parser-schema-id: <anonymous-schema-190>
                      market_ticker:
                        type: string
                        x-parser-schema-id: <anonymous-schema-191>
                      side:
                        type: string
                        x-parser-schema-id: <anonymous-schema-192>
                      yes_settlement_value_dollars:
                        type: string
                        description: >-
                          Yes settlement value in dollars for the selected leg
                          (optional)
                        x-parser-schema-id: <anonymous-schema-193>
                    x-parser-schema-id: <anonymous-schema-189>
                  x-parser-schema-id: <anonymous-schema-188>
              x-parser-schema-id: <anonymous-schema-177>
          x-parser-schema-id: rfqCreatedPayload
        title: RFQ Created
        description: Notification when an RFQ is created
        example: |-
          {
            "type": "rfq_created",
            "sid": 15,
            "msg": {
              "id": "rfq_123",
              "creator_id": "",
              "market_ticker": "FED-23DEC-T3.00",
              "event_ticker": "FED-23DEC",
              "contracts": 100,
              "contracts_fp": "100.00",
              "target_cost": 3500,
              "target_cost_dollars": "0.35",
              "created_ts": "2024-12-01T10:00:00Z"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: rfqCreated
    bindings: []
    extensions: &ref_1
      - id: x-parser-unique-object-id
        value: communications
  - &ref_3
    id: receiveRFQDeleted
    title: RFQ Deleted
    description: Receive RFQ deleted notifications
    type: send
    messages:
      - &ref_8
        id: rfqDeleted
        contentType: application/json
        payload:
          - name: RFQ Deleted
            description: Notification when an RFQ is deleted
            type: object
            properties:
              - name: type
                type: string
                description: rfq_deleted
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: id
                    type: string
                    description: Unique identifier for the RFQ
                    required: false
                  - name: creator_id
                    type: string
                    description: Public communications ID of the RFQ creator (anonymized)
                    required: false
                  - name: market_ticker
                    type: string
                    description: Market ticker for the RFQ
                    required: false
                  - name: event_ticker
                    type: string
                    description: Event ticker (optional)
                    required: false
                  - name: contracts
                    type: integer
                    description: Number of contracts requested (optional)
                    required: false
                  - name: contracts_fp
                    type: string
                    description: Fixed-point contracts requested (2 decimals) (optional)
                    required: false
                  - name: target_cost
                    type: integer
                    description: Target cost in centicents (optional)
                    required: false
                  - name: target_cost_dollars
                    type: string
                    description: Target cost in dollars (optional)
                    required: false
                  - name: deleted_ts
                    type: string
                    description: Timestamp when the RFQ was deleted
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: rfq_deleted
              x-parser-schema-id: <anonymous-schema-194>
            sid: *ref_0
            msg:
              type: object
              required:
                - id
                - creator_id
                - market_ticker
                - deleted_ts
              properties:
                id:
                  type: string
                  description: Unique identifier for the RFQ
                  x-parser-schema-id: <anonymous-schema-196>
                creator_id:
                  type: string
                  description: Public communications ID of the RFQ creator (anonymized)
                  x-parser-schema-id: <anonymous-schema-197>
                market_ticker:
                  type: string
                  description: Market ticker for the RFQ
                  x-parser-schema-id: <anonymous-schema-198>
                event_ticker:
                  type: string
                  description: Event ticker (optional)
                  x-parser-schema-id: <anonymous-schema-199>
                contracts:
                  type: integer
                  description: Number of contracts requested (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-200>
                contracts_fp:
                  type: string
                  description: Fixed-point contracts requested (2 decimals) (optional)
                  x-parser-schema-id: <anonymous-schema-201>
                target_cost:
                  type: integer
                  description: Target cost in centicents (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-202>
                target_cost_dollars:
                  type: string
                  description: Target cost in dollars (optional)
                  x-parser-schema-id: <anonymous-schema-203>
                deleted_ts:
                  type: string
                  description: Timestamp when the RFQ was deleted
                  format: date-time
                  x-parser-schema-id: <anonymous-schema-204>
              x-parser-schema-id: <anonymous-schema-195>
          x-parser-schema-id: rfqDeletedPayload
        title: RFQ Deleted
        description: Notification when an RFQ is deleted
        example: |-
          {
            "type": "rfq_deleted",
            "sid": 15,
            "msg": {
              "id": "rfq_123",
              "creator_id": "comm_abc123",
              "market_ticker": "FED-23DEC-T3.00",
              "event_ticker": "FED-23DEC",
              "contracts": 100,
              "contracts_fp": "100.00",
              "target_cost": 3500,
              "target_cost_dollars": "0.35",
              "deleted_ts": "2024-12-01T10:05:00Z"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: rfqDeleted
    bindings: []
    extensions: *ref_1
  - &ref_4
    id: receiveQuoteCreated
    title: Quote Created
    description: Receive quote created notifications
    type: send
    messages:
      - &ref_9
        id: quoteCreated
        contentType: application/json
        payload:
          - name: Quote Created
            description: Notification when a quote is created on an RFQ
            type: object
            properties:
              - name: type
                type: string
                description: quote_created
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: quote_id
                    type: string
                    description: Unique identifier for the quote
                    required: false
                  - name: rfq_id
                    type: string
                    description: Identifier of the RFQ this quote is for
                    required: false
                  - name: quote_creator_id
                    type: string
                    description: Public communications ID of the quote creator (anonymized)
                    required: false
                  - name: market_ticker
                    type: string
                    description: Market ticker for the quote
                    required: false
                  - name: event_ticker
                    type: string
                    description: Event ticker (optional)
                    required: false
                  - name: yes_bid
                    type: integer
                    description: Yes side bid price in cents
                    required: false
                  - name: no_bid
                    type: integer
                    description: No side bid price in cents
                    required: false
                  - name: yes_bid_dollars
                    type: string
                    description: Yes side bid price in dollars
                    required: false
                  - name: no_bid_dollars
                    type: string
                    description: No side bid price in dollars
                    required: false
                  - name: yes_contracts_offered
                    type: integer
                    description: Number of yes contracts offered (optional)
                    required: false
                  - name: no_contracts_offered
                    type: integer
                    description: Number of no contracts offered (optional)
                    required: false
                  - name: yes_contracts_offered_fp
                    type: string
                    description: Fixed-point yes contracts offered (2 decimals) (optional)
                    required: false
                  - name: no_contracts_offered_fp
                    type: string
                    description: Fixed-point no contracts offered (2 decimals) (optional)
                    required: false
                  - name: rfq_target_cost
                    type: integer
                    description: Target cost from the RFQ in centicents (optional)
                    required: false
                  - name: rfq_target_cost_dollars
                    type: string
                    description: Target cost from the RFQ in dollars (optional)
                    required: false
                  - name: created_ts
                    type: string
                    description: Timestamp when the quote was created
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: quote_created
              x-parser-schema-id: <anonymous-schema-205>
            sid: *ref_0
            msg:
              type: object
              required:
                - quote_id
                - rfq_id
                - quote_creator_id
                - market_ticker
                - yes_bid
                - no_bid
                - yes_bid_dollars
                - no_bid_dollars
                - created_ts
              properties:
                quote_id:
                  type: string
                  description: Unique identifier for the quote
                  x-parser-schema-id: <anonymous-schema-207>
                rfq_id:
                  type: string
                  description: Identifier of the RFQ this quote is for
                  x-parser-schema-id: <anonymous-schema-208>
                quote_creator_id:
                  type: string
                  description: Public communications ID of the quote creator (anonymized)
                  x-parser-schema-id: <anonymous-schema-209>
                market_ticker:
                  type: string
                  description: Market ticker for the quote
                  x-parser-schema-id: <anonymous-schema-210>
                event_ticker:
                  type: string
                  description: Event ticker (optional)
                  x-parser-schema-id: <anonymous-schema-211>
                yes_bid:
                  type: integer
                  description: Yes side bid price in cents
                  format: int32
                  x-parser-schema-id: <anonymous-schema-212>
                no_bid:
                  type: integer
                  description: No side bid price in cents
                  format: int32
                  x-parser-schema-id: <anonymous-schema-213>
                yes_bid_dollars:
                  type: string
                  description: Yes side bid price in dollars
                  x-parser-schema-id: <anonymous-schema-214>
                no_bid_dollars:
                  type: string
                  description: No side bid price in dollars
                  x-parser-schema-id: <anonymous-schema-215>
                yes_contracts_offered:
                  type: integer
                  description: Number of yes contracts offered (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-216>
                no_contracts_offered:
                  type: integer
                  description: Number of no contracts offered (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-217>
                yes_contracts_offered_fp:
                  type: string
                  description: Fixed-point yes contracts offered (2 decimals) (optional)
                  x-parser-schema-id: <anonymous-schema-218>
                no_contracts_offered_fp:
                  type: string
                  description: Fixed-point no contracts offered (2 decimals) (optional)
                  x-parser-schema-id: <anonymous-schema-219>
                rfq_target_cost:
                  type: integer
                  description: Target cost from the RFQ in centicents (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-220>
                rfq_target_cost_dollars:
                  type: string
                  description: Target cost from the RFQ in dollars (optional)
                  x-parser-schema-id: <anonymous-schema-221>
                created_ts:
                  type: string
                  description: Timestamp when the quote was created
                  format: date-time
                  x-parser-schema-id: <anonymous-schema-222>
              x-parser-schema-id: <anonymous-schema-206>
          x-parser-schema-id: quoteCreatedPayload
        title: Quote Created
        description: Notification when a quote is created on an RFQ
        example: |-
          {
            "type": "quote_created",
            "sid": 15,
            "msg": {
              "quote_id": "quote_456",
              "rfq_id": "rfq_123",
              "quote_creator_id": "comm_def456",
              "market_ticker": "FED-23DEC-T3.00",
              "event_ticker": "FED-23DEC",
              "yes_bid": 35,
              "no_bid": 65,
              "yes_bid_dollars": "0.35",
              "no_bid_dollars": "0.65",
              "yes_contracts_offered": 100,
              "no_contracts_offered": 200,
              "yes_contracts_offered_fp": "100.00",
              "no_contracts_offered_fp": "200.00",
              "rfq_target_cost": 3500,
              "rfq_target_cost_dollars": "0.35",
              "created_ts": "2024-12-01T10:02:00Z"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: quoteCreated
    bindings: []
    extensions: *ref_1
  - &ref_5
    id: receiveQuoteAccepted
    title: Quote Accepted
    description: Receive quote accepted notifications
    type: send
    messages:
      - &ref_10
        id: quoteAccepted
        contentType: application/json
        payload:
          - name: Quote Accepted
            description: Notification when a quote is accepted
            type: object
            properties:
              - name: type
                type: string
                description: quote_accepted
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: quote_id
                    type: string
                    description: Unique identifier for the quote
                    required: false
                  - name: rfq_id
                    type: string
                    description: Identifier of the RFQ this quote is for
                    required: false
                  - name: quote_creator_id
                    type: string
                    description: Public communications ID of the quote creator (anonymized)
                    required: false
                  - name: market_ticker
                    type: string
                    description: Market ticker for the quote
                    required: false
                  - name: event_ticker
                    type: string
                    description: Event ticker (optional)
                    required: false
                  - name: yes_bid
                    type: integer
                    description: Yes side bid price in cents
                    required: false
                  - name: no_bid
                    type: integer
                    description: No side bid price in cents
                    required: false
                  - name: yes_bid_dollars
                    type: string
                    description: Yes side bid price in dollars
                    required: false
                  - name: no_bid_dollars
                    type: string
                    description: No side bid price in dollars
                    required: false
                  - name: accepted_side
                    type: string
                    description: Which side was accepted (yes/no) (optional)
                    required: false
                  - name: contracts_accepted
                    type: integer
                    description: >-
                      Number of contracts accepted. Present when the RFQ
                      specified OrderQty or when a partial fill was requested
                      (optional)
                    required: false
                  - name: yes_contracts_offered
                    type: integer
                    description: Number of yes contracts offered (optional)
                    required: false
                  - name: no_contracts_offered
                    type: integer
                    description: Number of no contracts offered (optional)
                    required: false
                  - name: contracts_accepted_fp
                    type: string
                    description: Fixed-point contracts accepted (2 decimals) (optional)
                    required: false
                  - name: yes_contracts_offered_fp
                    type: string
                    description: Fixed-point yes contracts offered (2 decimals) (optional)
                    required: false
                  - name: no_contracts_offered_fp
                    type: string
                    description: Fixed-point no contracts offered (2 decimals) (optional)
                    required: false
                  - name: rfq_target_cost
                    type: integer
                    description: Target cost from the RFQ in centicents (optional)
                    required: false
                  - name: rfq_target_cost_dollars
                    type: string
                    description: Target cost from the RFQ in dollars (optional)
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: quote_accepted
              x-parser-schema-id: <anonymous-schema-223>
            sid: *ref_0
            msg:
              type: object
              required:
                - quote_id
                - rfq_id
                - quote_creator_id
                - market_ticker
                - yes_bid
                - no_bid
                - yes_bid_dollars
                - no_bid_dollars
              properties:
                quote_id:
                  type: string
                  description: Unique identifier for the quote
                  x-parser-schema-id: <anonymous-schema-225>
                rfq_id:
                  type: string
                  description: Identifier of the RFQ this quote is for
                  x-parser-schema-id: <anonymous-schema-226>
                quote_creator_id:
                  type: string
                  description: Public communications ID of the quote creator (anonymized)
                  x-parser-schema-id: <anonymous-schema-227>
                market_ticker:
                  type: string
                  description: Market ticker for the quote
                  x-parser-schema-id: <anonymous-schema-228>
                event_ticker:
                  type: string
                  description: Event ticker (optional)
                  x-parser-schema-id: <anonymous-schema-229>
                yes_bid:
                  type: integer
                  description: Yes side bid price in cents
                  format: int32
                  x-parser-schema-id: <anonymous-schema-230>
                no_bid:
                  type: integer
                  description: No side bid price in cents
                  format: int32
                  x-parser-schema-id: <anonymous-schema-231>
                yes_bid_dollars:
                  type: string
                  description: Yes side bid price in dollars
                  x-parser-schema-id: <anonymous-schema-232>
                no_bid_dollars:
                  type: string
                  description: No side bid price in dollars
                  x-parser-schema-id: <anonymous-schema-233>
                accepted_side:
                  type: string
                  description: Which side was accepted (yes/no) (optional)
                  enum:
                    - 'yes'
                    - 'no'
                  x-parser-schema-id: <anonymous-schema-234>
                contracts_accepted:
                  type: integer
                  description: >-
                    Number of contracts accepted. Present when the RFQ specified
                    OrderQty or when a partial fill was requested (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-235>
                yes_contracts_offered:
                  type: integer
                  description: Number of yes contracts offered (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-236>
                no_contracts_offered:
                  type: integer
                  description: Number of no contracts offered (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-237>
                contracts_accepted_fp:
                  type: string
                  description: Fixed-point contracts accepted (2 decimals) (optional)
                  x-parser-schema-id: <anonymous-schema-238>
                yes_contracts_offered_fp:
                  type: string
                  description: Fixed-point yes contracts offered (2 decimals) (optional)
                  x-parser-schema-id: <anonymous-schema-239>
                no_contracts_offered_fp:
                  type: string
                  description: Fixed-point no contracts offered (2 decimals) (optional)
                  x-parser-schema-id: <anonymous-schema-240>
                rfq_target_cost:
                  type: integer
                  description: Target cost from the RFQ in centicents (optional)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-241>
                rfq_target_cost_dollars:
                  type: string
                  description: Target cost from the RFQ in dollars (optional)
                  x-parser-schema-id: <anonymous-schema-242>
              x-parser-schema-id: <anonymous-schema-224>
          x-parser-schema-id: quoteAcceptedPayload
        title: Quote Accepted
        description: Notification when a quote is accepted
        example: |-
          {
            "type": "quote_accepted",
            "sid": 15,
            "msg": {
              "quote_id": "quote_456",
              "rfq_id": "rfq_123",
              "quote_creator_id": "comm_def456",
              "market_ticker": "FED-23DEC-T3.00",
              "event_ticker": "FED-23DEC",
              "yes_bid": 35,
              "no_bid": 65,
              "yes_bid_dollars": "0.35",
              "no_bid_dollars": "0.65",
              "accepted_side": "yes",
              "contracts_accepted": 50,
              "contracts_accepted_fp": "50.00",
              "yes_contracts_offered": 100,
              "no_contracts_offered": 200,
              "yes_contracts_offered_fp": "100.00",
              "no_contracts_offered_fp": "200.00",
              "rfq_target_cost": 3500,
              "rfq_target_cost_dollars": "0.35"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: quoteAccepted
    bindings: []
    extensions: *ref_1
  - &ref_6
    id: receiveQuoteExecuted
    title: Quote Executed
    description: >-
      Receive quote executed notifications with order details for fill
      correlation
    type: send
    messages:
      - &ref_11
        id: quoteExecuted
        contentType: application/json
        payload:
          - name: Quote Executed
            description: Notification when a quote is executed and orders are placed
            type: object
            properties:
              - name: type
                type: string
                description: quote_executed
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: quote_id
                    type: string
                    description: Unique identifier for the quote that was executed
                    required: false
                  - name: rfq_id
                    type: string
                    description: Identifier of the RFQ this quote was for
                    required: false
                  - name: quote_creator_id
                    type: string
                    description: Anonymized identifier for the quote creator
                    required: false
                  - name: rfq_creator_id
                    type: string
                    description: Anonymized identifier for the RFQ creator
                    required: false
                  - name: order_id
                    type: string
                    description: >-
                      Your order ID resulting from the quote execution. Use this
                      to match with fill messages
                    required: false
                  - name: client_order_id
                    type: string
                    description: >-
                      Your client order ID for the executed order. Use this to
                      correlate with fill messages
                    required: false
                  - name: market_ticker
                    type: string
                    description: Market ticker for the executed quote
                    required: false
                  - name: executed_ts
                    type: string
                    description: >-
                      Timestamp when the quote was executed and orders were
                      placed
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: quote_executed
              x-parser-schema-id: <anonymous-schema-243>
            sid: *ref_0
            msg:
              type: object
              required:
                - quote_id
                - rfq_id
                - quote_creator_id
                - rfq_creator_id
                - order_id
                - client_order_id
                - market_ticker
                - executed_ts
              properties:
                quote_id:
                  type: string
                  description: Unique identifier for the quote that was executed
                  x-parser-schema-id: <anonymous-schema-245>
                rfq_id:
                  type: string
                  description: Identifier of the RFQ this quote was for
                  x-parser-schema-id: <anonymous-schema-246>
                quote_creator_id:
                  type: string
                  description: Anonymized identifier for the quote creator
                  x-parser-schema-id: <anonymous-schema-247>
                rfq_creator_id:
                  type: string
                  description: Anonymized identifier for the RFQ creator
                  x-parser-schema-id: <anonymous-schema-248>
                order_id:
                  type: string
                  description: >-
                    Your order ID resulting from the quote execution. Use this
                    to match with fill messages
                  x-parser-schema-id: <anonymous-schema-249>
                client_order_id:
                  type: string
                  description: >-
                    Your client order ID for the executed order. Use this to
                    correlate with fill messages
                  x-parser-schema-id: <anonymous-schema-250>
                market_ticker:
                  type: string
                  description: Market ticker for the executed quote
                  x-parser-schema-id: <anonymous-schema-251>
                executed_ts:
                  type: string
                  description: Timestamp when the quote was executed and orders were placed
                  format: date-time
                  x-parser-schema-id: <anonymous-schema-252>
              x-parser-schema-id: <anonymous-schema-244>
          x-parser-schema-id: quoteExecutedPayload
        title: Quote Executed
        description: Notification when a quote is executed and orders are placed
        example: |-
          {
            "type": "quote_executed",
            "sid": 15,
            "msg": {
              "quote_id": "quote_456",
              "rfq_id": "rfq_123",
              "quote_creator_id": "a1b2c3d4e5f6...",
              "rfq_creator_id": "f6e5d4c3b2a1...",
              "order_id": "order_789",
              "client_order_id": "my_client_order_123",
              "market_ticker": "FED-23DEC-T3.00",
              "executed_ts": "2024-12-01T10:05:00Z"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: quoteExecuted
    bindings: []
    extensions: *ref_1
sendOperations: []
receiveOperations:
  - *ref_2
  - *ref_3
  - *ref_4
  - *ref_5
  - *ref_6
sendMessages: []
receiveMessages:
  - *ref_7
  - *ref_8
  - *ref_9
  - *ref_10
  - *ref_11
extensions:
  - id: x-parser-unique-object-id
    value: communications
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/connection-keep-alive.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Connection Keep-Alive

> WebSocket control frames for connection management.

Kalshi sends Ping frames (`0x9`) every 10 seconds with body `heartbeat` to maintain the connection.
Clients should respond with Pong frames (`0xA`). Clients may also send Ping frames to which Kalshi will respond with Pong.




## AsyncAPI

````yaml asyncapi.yaml control_frames
id: control_frames
title: Connection Keep-Alive
description: >
  WebSocket control frames for connection management.


  Kalshi sends Ping frames (`0x9`) every 10 seconds with body `heartbeat` to
  maintain the connection.

  Clients should respond with Pong frames (`0xA`). Clients may also send Ping
  frames to which Kalshi will respond with Pong.
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: /
parameters: []
bindings: []
operations:
  - &ref_1
    id: sendPing
    title: Send Ping
    description: Client sends Ping control frame to elicit Pong from Kalshi
    type: receive
    messages:
      - &ref_5
        id: incomingPing
        contentType: application/octet-stream
        payload:
          - type: string
            const: ''
            x-parser-schema-id: <anonymous-schema-44>
            name: Ping
            description: Client sends Ping frame (0x9) to elicit Pong from Kalshi
        headers: []
        jsonPayloadSchema:
          type: string
          const: ''
          x-parser-schema-id: <anonymous-schema-44>
        title: Ping
        description: Client sends Ping frame (0x9) to elicit Pong from Kalshi
        example: '""'
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: incomingPing
    bindings: []
    extensions: &ref_0
      - id: x-parser-unique-object-id
        value: control_frames
  - &ref_2
    id: sendPong
    title: Send Pong
    description: Client sends Pong control frame in response to Kalshi Ping
    type: receive
    messages:
      - &ref_6
        id: incomingPong
        contentType: application/octet-stream
        payload:
          - type: string
            const: ''
            x-parser-schema-id: <anonymous-schema-45>
            name: Pong
            description: Client replies to Ping with Pong Frame (0xA)
        headers: []
        jsonPayloadSchema:
          type: string
          const: ''
          x-parser-schema-id: <anonymous-schema-45>
        title: Pong
        description: Client replies to Ping with Pong Frame (0xA)
        example: '""'
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: incomingPong
    bindings: []
    extensions: *ref_0
  - &ref_3
    id: receivePing
    title: Receive Ping
    description: Kalshi sends Ping control frame with body 'heartbeat'
    type: send
    messages:
      - &ref_7
        id: outgoingPing
        contentType: application/octet-stream
        payload:
          - type: string
            const: heartbeat
            x-parser-schema-id: <anonymous-schema-46>
            name: Ping
            description: >-
              Kalshi sends Ping (0x9) with body 'heartbeat' to elicit Pong from
              client
        headers: []
        jsonPayloadSchema:
          type: string
          const: heartbeat
          x-parser-schema-id: <anonymous-schema-46>
        title: Ping
        description: >-
          Kalshi sends Ping (0x9) with body 'heartbeat' to elicit Pong from
          client
        example: '"heartbeat"'
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: outgoingPing
    bindings: []
    extensions: *ref_0
  - &ref_4
    id: receivePong
    title: Receive Pong
    description: Kalshi sends Pong control frame in response to client Ping
    type: send
    messages:
      - &ref_8
        id: outgoingPong
        contentType: application/octet-stream
        payload:
          - type: string
            const: ''
            x-parser-schema-id: <anonymous-schema-47>
            name: Pong
            description: Kalshi responds to client Ping with Pong frame (0xA)
        headers: []
        jsonPayloadSchema:
          type: string
          const: ''
          x-parser-schema-id: <anonymous-schema-47>
        title: Pong
        description: Kalshi responds to client Ping with Pong frame (0xA)
        example: '""'
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: outgoingPong
    bindings: []
    extensions: *ref_0
sendOperations:
  - *ref_1
  - *ref_2
receiveOperations:
  - *ref_3
  - *ref_4
sendMessages:
  - *ref_5
  - *ref_6
receiveMessages:
  - *ref_7
  - *ref_8
extensions:
  - id: x-parser-unique-object-id
    value: control_frames
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/market-&-event-lifecycle.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Market & Event Lifecycle

> Market state changes and event creation notifications.

**Requirements:**
- Authentication required (authenticated WebSocket connection)
- Receives all market and event lifecycle notifications (`market_ticker` filters are not supported)
- Event creation notifications

**Use case:** Tracking market lifecycle including creation, de(activation), close date changes, determination, settlement




## AsyncAPI

````yaml asyncapi.yaml market_lifecycle_v2
id: market_lifecycle_v2
title: Market & Event Lifecycle
description: >
  Market state changes and event creation notifications.


  **Requirements:**

  - Authentication required (authenticated WebSocket connection)

  - Receives all market and event lifecycle notifications (`market_ticker`
  filters are not supported)

  - Event creation notifications


  **Use case:** Tracking market lifecycle including creation, de(activation),
  close date changes, determination, settlement
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: market_lifecycle_v2
parameters: []
bindings: []
operations:
  - &ref_2
    id: receiveMarketLifecycleV2
    title: Market Lifecycle Event
    description: Receive market lifecycle updates (open, close, determination, etc.)
    type: send
    messages:
      - &ref_4
        id: marketLifecycleV2
        contentType: application/json
        payload:
          - name: Market Lifecycle V2
            description: >-
              Market lifecycle events (created, activated, deactivated,
              close_date_updated, determined, settled)
            type: object
            properties:
              - name: type
                type: string
                description: market_lifecycle_v2
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: event_type
                    type: string
                    description: >
                      Field to annotate which of the event type this event is
                      for:

                      - `created` - Market created

                      - `activated` - Market activated

                      - `deactivated` - Market deactivated

                      - `close_date_updated` - Market close date updated

                      - `determined` - Market determined

                      - `settled` - Market settled
                    required: false
                  - name: market_ticker
                    type: string
                    description: Unique market identifier
                    required: false
                  - name: open_ts
                    type: integer
                    description: >-
                      Optional - This key will ONLY exist when the market is
                      created. Unix timestamp for when the market opened (in
                      seconds)
                    required: false
                  - name: close_ts
                    type: integer
                    description: >-
                      Optional - This key will ONLY exist when the market is
                      created OR when the close date is updated. Unix timestamp
                      for when the market is scheduled to close (in seconds).
                      Will be updated in case of early determination markets
                    required: false
                  - name: result
                    type: string
                    description: >-
                      Optional - This key will ONLY exist when the market is
                      determined. Result of the market
                    required: false
                  - name: determination_ts
                    type: integer
                    description: >-
                      Optional - This key will ONLY exist when the market is
                      determined. Unix timestamp for when the market is
                      determined (in seconds)
                    required: false
                  - name: settlement_value
                    type: string
                    description: >-
                      Optional - This key will ONLY exist when the market is
                      determined. Settlement value of the market in fixed-point
                      dollars (e.g. "0.5000")
                    required: false
                  - name: settled_ts
                    type: integer
                    description: >-
                      Optional - This key will ONLY exist when the market is
                      settled. Unix timestamp for when the market is settled (in
                      seconds)
                    required: false
                  - name: is_deactivated
                    type: boolean
                    description: >-
                      Optional - This key will ONLY exist when the market is
                      paused/unpaused. Boolean flag to indicate if trading is
                      paused on an open market. This should only be interpreted
                      for an open market
                    required: false
                  - name: additional_metadata
                    type: object
                    description: >-
                      Optional - This key will only be emitted when the market
                      is created
                    required: false
                    properties:
                      - name: name
                        type: string
                        required: false
                      - name: title
                        type: string
                        required: false
                      - name: yes_sub_title
                        type: string
                        required: false
                      - name: no_sub_title
                        type: string
                        required: false
                      - name: rules_primary
                        type: string
                        required: false
                      - name: rules_secondary
                        type: string
                        required: false
                      - name: can_close_early
                        type: boolean
                        required: false
                      - name: event_ticker
                        type: string
                        required: false
                      - name: expected_expiration_ts
                        type: integer
                        required: false
                      - name: strike_type
                        type: string
                        required: false
                      - name: floor_strike
                        type: number
                        required: false
                      - name: cap_strike
                        type: number
                        required: false
                      - name: custom_strike
                        type: object
                        required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: market_lifecycle_v2
              x-parser-schema-id: <anonymous-schema-134>
            sid: &ref_0
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            msg:
              type: object
              required:
                - event_type
                - market_ticker
              properties:
                event_type:
                  type: string
                  description: |
                    Field to annotate which of the event type this event is for:
                    - `created` - Market created
                    - `activated` - Market activated
                    - `deactivated` - Market deactivated
                    - `close_date_updated` - Market close date updated
                    - `determined` - Market determined
                    - `settled` - Market settled
                  enum:
                    - created
                    - deactivated
                    - activated
                    - close_date_updated
                    - determined
                    - settled
                  x-parser-schema-id: <anonymous-schema-136>
                market_ticker:
                  type: string
                  description: Unique market identifier
                  pattern: ^[A-Z0-9-]+$
                  examples:
                    - FED-23DEC-T3.00
                    - HIGHNY-22DEC23-B53.5
                  x-parser-schema-id: marketTicker
                open_ts:
                  type: integer
                  description: >-
                    Optional - This key will ONLY exist when the market is
                    created. Unix timestamp for when the market opened (in
                    seconds)
                  format: int64
                  x-parser-schema-id: <anonymous-schema-137>
                close_ts:
                  type: integer
                  description: >-
                    Optional - This key will ONLY exist when the market is
                    created OR when the close date is updated. Unix timestamp
                    for when the market is scheduled to close (in seconds). Will
                    be updated in case of early determination markets
                  format: int64
                  x-parser-schema-id: <anonymous-schema-138>
                result:
                  type: string
                  description: >-
                    Optional - This key will ONLY exist when the market is
                    determined. Result of the market
                  x-parser-schema-id: <anonymous-schema-139>
                determination_ts:
                  type: integer
                  description: >-
                    Optional - This key will ONLY exist when the market is
                    determined. Unix timestamp for when the market is determined
                    (in seconds)
                  format: int64
                  x-parser-schema-id: <anonymous-schema-140>
                settlement_value:
                  type: string
                  description: >-
                    Optional - This key will ONLY exist when the market is
                    determined. Settlement value of the market in fixed-point
                    dollars (e.g. "0.5000")
                  x-parser-schema-id: <anonymous-schema-141>
                settled_ts:
                  type: integer
                  description: >-
                    Optional - This key will ONLY exist when the market is
                    settled. Unix timestamp for when the market is settled (in
                    seconds)
                  format: int64
                  x-parser-schema-id: <anonymous-schema-142>
                is_deactivated:
                  type: boolean
                  description: >-
                    Optional - This key will ONLY exist when the market is
                    paused/unpaused. Boolean flag to indicate if trading is
                    paused on an open market. This should only be interpreted
                    for an open market
                  x-parser-schema-id: <anonymous-schema-143>
                additional_metadata:
                  type: object
                  description: >-
                    Optional - This key will only be emitted when the market is
                    created
                  properties:
                    name:
                      type: string
                      x-parser-schema-id: <anonymous-schema-145>
                    title:
                      type: string
                      x-parser-schema-id: <anonymous-schema-146>
                    yes_sub_title:
                      type: string
                      x-parser-schema-id: <anonymous-schema-147>
                    no_sub_title:
                      type: string
                      x-parser-schema-id: <anonymous-schema-148>
                    rules_primary:
                      type: string
                      x-parser-schema-id: <anonymous-schema-149>
                    rules_secondary:
                      type: string
                      x-parser-schema-id: <anonymous-schema-150>
                    can_close_early:
                      type: boolean
                      x-parser-schema-id: <anonymous-schema-151>
                    event_ticker:
                      type: string
                      x-parser-schema-id: <anonymous-schema-152>
                    expected_expiration_ts:
                      type: integer
                      format: int64
                      x-parser-schema-id: <anonymous-schema-153>
                    strike_type:
                      type: string
                      x-parser-schema-id: <anonymous-schema-154>
                    floor_strike:
                      type: number
                      x-parser-schema-id: <anonymous-schema-155>
                    cap_strike:
                      type: number
                      x-parser-schema-id: <anonymous-schema-156>
                    custom_strike:
                      type: object
                      x-parser-schema-id: <anonymous-schema-157>
                  x-parser-schema-id: <anonymous-schema-144>
              x-parser-schema-id: <anonymous-schema-135>
          x-parser-schema-id: marketLifecycleV2Payload
        title: Market Lifecycle V2
        description: >-
          Market lifecycle events (created, activated, deactivated,
          close_date_updated, determined, settled)
        example: |-
          {
            "type": "market_lifecycle_v2",
            "sid": 13,
            "msg": {
              "market_ticker": "INXD-23SEP14-B4487",
              "event_type": "created",
              "open_ts": 1694635200,
              "close_ts": 1694721600,
              "additional_metadata": {
                "name": "S&P 500 daily return on Sep 14",
                "title": "S&P 500 closes up by 0.02% or more",
                "yes_sub_title": "S&P 500 closes up 0.02%+",
                "no_sub_title": "S&P 500 closes up <0.02%",
                "rules_primary": "The S&P 500 index level at 4:00 PM ET...",
                "rules_secondary": "",
                "can_close_early": true,
                "event_ticker": "INXD-23SEP14",
                "expected_expiration_ts": 1694721600,
                "strike_type": "greater",
                "floor_strike": 4487
              }
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: marketLifecycleV2
    bindings: []
    extensions: &ref_1
      - id: x-parser-unique-object-id
        value: market_lifecycle_v2
  - &ref_3
    id: receiveEventLifecycle
    title: Event Lifecycle
    description: Receive event creation notifications
    type: send
    messages:
      - &ref_5
        id: eventLifecycle
        contentType: application/json
        payload:
          - name: Event Lifecycle
            description: Event creation notification
            type: object
            properties:
              - name: type
                type: string
                description: event_lifecycle
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: event_ticker
                    type: string
                    description: Unique identifier for the event being created
                    required: false
                  - name: title
                    type: string
                    description: Title of event
                    required: false
                  - name: subtitle
                    type: string
                    description: Subtitle of event
                    required: false
                  - name: collateral_return_type
                    type: string
                    description: >-
                      Collateral return type, MECNET or DIRECNET of the event.
                      Empty if there is no collateral return scheme for the
                      event
                    required: false
                  - name: series_ticker
                    type: string
                    description: Series ticker for the event
                    required: false
                  - name: strike_date
                    type: integer
                    description: >-
                      Optional - Unix timestamp to indicate the strike date of
                      the event if there is one
                    required: false
                  - name: strike_period
                    type: string
                    description: >-
                      Optional - String to indicate the strike period of the
                      event if there is one
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: event_lifecycle
              x-parser-schema-id: <anonymous-schema-158>
            sid: *ref_0
            msg:
              type: object
              required:
                - event_ticker
                - title
                - subtitle
                - collateral_return_type
                - series_ticker
              properties:
                event_ticker:
                  type: string
                  description: Unique identifier for the event being created
                  x-parser-schema-id: <anonymous-schema-160>
                title:
                  type: string
                  description: Title of event
                  x-parser-schema-id: <anonymous-schema-161>
                subtitle:
                  type: string
                  description: Subtitle of event
                  x-parser-schema-id: <anonymous-schema-162>
                collateral_return_type:
                  type: string
                  description: >-
                    Collateral return type, MECNET or DIRECNET of the event.
                    Empty if there is no collateral return scheme for the event
                  enum:
                    - MECNET
                    - DIRECNET
                    - ''
                  x-parser-schema-id: <anonymous-schema-163>
                series_ticker:
                  type: string
                  description: Series ticker for the event
                  x-parser-schema-id: <anonymous-schema-164>
                strike_date:
                  type: integer
                  description: >-
                    Optional - Unix timestamp to indicate the strike date of the
                    event if there is one
                  format: int64
                  x-parser-schema-id: <anonymous-schema-165>
                strike_period:
                  type: string
                  description: >-
                    Optional - String to indicate the strike period of the event
                    if there is one
                  x-parser-schema-id: <anonymous-schema-166>
              x-parser-schema-id: <anonymous-schema-159>
          x-parser-schema-id: eventLifecyclePayload
        title: Event Lifecycle
        description: Event creation notification
        example: |-
          {
            "type": "event_lifecycle",
            "sid": 5,
            "msg": {
              "event_ticker": "KXQUICKSETTLE-26JAN25H2150",
              "title": "What will 1+1 equal on Jan 25 at 21:50?",
              "subtitle": "Jan 25 at 21:50",
              "collateral_return_type": "MECNET",
              "series_ticker": "KXQUICKSETTLE"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: eventLifecycle
    bindings: []
    extensions: *ref_1
sendOperations: []
receiveOperations:
  - *ref_2
  - *ref_3
sendMessages: []
receiveMessages:
  - *ref_4
  - *ref_5
extensions:
  - id: x-parser-unique-object-id
    value: market_lifecycle_v2
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/market-positions.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Market Positions

> Real-time updates of your positions in markets. Requires authentication.

**Requirements:**
- Authentication required
- Market specification optional (omit to receive all positions)
- Filters are by `market_ticker`/`market_tickers` only; `market_id`/`market_ids` are not supported
- Updates sent when your position changes due to trades, settlements, etc.

**Monetary Values:**
All monetary values (position_cost, realized_pnl, fees_paid) are returned in centi-cents (1/10,000th of a dollar).
To convert to dollars, divide by 10,000.

**Use case:** Portfolio tracking, position monitoring, P&L calculations




## AsyncAPI

````yaml asyncapi.yaml market_positions
id: market_positions
title: Market Positions
description: >
  Real-time updates of your positions in markets. Requires authentication.


  **Requirements:**

  - Authentication required

  - Market specification optional (omit to receive all positions)

  - Filters are by `market_ticker`/`market_tickers` only;
  `market_id`/`market_ids` are not supported

  - Updates sent when your position changes due to trades, settlements, etc.


  **Monetary Values:**

  All monetary values (position_cost, realized_pnl, fees_paid) are returned in
  centi-cents (1/10,000th of a dollar).

  To convert to dollars, divide by 10,000.


  **Use case:** Portfolio tracking, position monitoring, P&L calculations
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: market_positions
parameters: []
bindings: []
operations:
  - &ref_0
    id: receiveMarketPosition
    title: Market Position Update
    description: Receive updates for your market positions
    type: send
    messages:
      - &ref_1
        id: marketPosition
        contentType: application/json
        payload:
          - name: Market Position Update
            description: Real-time position updates for authenticated user
            type: object
            properties:
              - name: type
                type: string
                description: market_position
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: user_id
                    type: string
                    description: User ID for the position
                    required: false
                  - name: market_ticker
                    type: string
                    description: Unique market identifier
                    required: false
                  - name: position
                    type: integer
                    description: >-
                      Current net position (positive for long, negative for
                      short)
                    required: false
                  - name: position_fp
                    type: string
                    description: Fixed-point net position (2 decimals)
                    required: false
                  - name: position_cost
                    type: integer
                    description: >-
                      Current cost basis of the position in centi-cents
                      (1/10,000th of a dollar)
                    required: false
                  - name: realized_pnl
                    type: integer
                    description: >-
                      Realized profit/loss in centi-cents (1/10,000th of a
                      dollar)
                    required: false
                  - name: fees_paid
                    type: integer
                    description: Total fees paid in centi-cents (1/10,000th of a dollar)
                    required: false
                  - name: position_fee_cost
                    type: integer
                    description: >-
                      Total position fee cost in centi-cents (1/10,000th of a
                      dollar)
                    required: false
                  - name: volume
                    type: integer
                    description: Total volume traded
                    required: false
                  - name: volume_fp
                    type: string
                    description: Fixed-point total volume traded (2 decimals)
                    required: false
                  - name: subaccount
                    type: integer
                    description: Optional subaccount number for the position
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: market_position
              x-parser-schema-id: <anonymous-schema-122>
            sid:
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            msg:
              type: object
              required:
                - user_id
                - market_ticker
                - position
                - position_fp
                - position_cost
                - realized_pnl
                - fees_paid
                - position_fee_cost
                - volume
                - volume_fp
              properties:
                user_id:
                  type: string
                  description: User ID for the position
                  x-parser-schema-id: <anonymous-schema-124>
                market_ticker:
                  type: string
                  description: Unique market identifier
                  pattern: ^[A-Z0-9-]+$
                  examples:
                    - FED-23DEC-T3.00
                    - HIGHNY-22DEC23-B53.5
                  x-parser-schema-id: marketTicker
                position:
                  type: integer
                  description: Current net position (positive for long, negative for short)
                  format: int32
                  x-parser-schema-id: <anonymous-schema-125>
                position_fp:
                  type: string
                  description: Fixed-point net position (2 decimals)
                  x-parser-schema-id: <anonymous-schema-126>
                position_cost:
                  type: integer
                  description: >-
                    Current cost basis of the position in centi-cents
                    (1/10,000th of a dollar)
                  format: int64
                  x-parser-schema-id: <anonymous-schema-127>
                realized_pnl:
                  type: integer
                  description: Realized profit/loss in centi-cents (1/10,000th of a dollar)
                  format: int64
                  x-parser-schema-id: <anonymous-schema-128>
                fees_paid:
                  type: integer
                  description: Total fees paid in centi-cents (1/10,000th of a dollar)
                  format: int64
                  x-parser-schema-id: <anonymous-schema-129>
                position_fee_cost:
                  type: integer
                  description: >-
                    Total position fee cost in centi-cents (1/10,000th of a
                    dollar)
                  format: int64
                  x-parser-schema-id: <anonymous-schema-130>
                volume:
                  type: integer
                  description: Total volume traded
                  format: int32
                  x-parser-schema-id: <anonymous-schema-131>
                volume_fp:
                  type: string
                  description: Fixed-point total volume traded (2 decimals)
                  x-parser-schema-id: <anonymous-schema-132>
                subaccount:
                  type: integer
                  description: Optional subaccount number for the position
                  x-parser-schema-id: <anonymous-schema-133>
              x-parser-schema-id: <anonymous-schema-123>
          x-parser-schema-id: marketPositionPayload
        title: Market Position Update
        description: Real-time position updates for authenticated user
        example: |-
          {
            "type": "market_position",
            "sid": 14,
            "msg": {
              "user_id": "user123",
              "market_ticker": "FED-23DEC-T3.00",
              "position": 100,
              "position_fp": "100.00",
              "position_cost": 500000,
              "realized_pnl": 100000,
              "fees_paid": 10000,
              "position_fee_cost": 5000,
              "volume": 15,
              "volume_fp": "15.00"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: marketPosition
    bindings: []
    extensions:
      - id: x-parser-unique-object-id
        value: market_positions
sendOperations: []
receiveOperations:
  - *ref_0
sendMessages: []
receiveMessages:
  - *ref_1
extensions:
  - id: x-parser-unique-object-id
    value: market_positions
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/market-ticker.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Market Ticker

> Market price, volume, and open interest updates.

**Requirements:**
- Authentication required (authenticated WebSocket connection)
- Market specification optional (omit to receive all markets)
- Supports `market_ticker`/`market_tickers` and `market_id`/`market_ids`
- Updates sent whenever any ticker field changes

**Use case:** Displaying current market prices and statistics




## AsyncAPI

````yaml asyncapi.yaml ticker
id: ticker
title: Market Ticker
description: |
  Market price, volume, and open interest updates.

  **Requirements:**
  - Authentication required (authenticated WebSocket connection)
  - Market specification optional (omit to receive all markets)
  - Supports `market_ticker`/`market_tickers` and `market_id`/`market_ids`
  - Updates sent whenever any ticker field changes

  **Use case:** Displaying current market prices and statistics
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: ticker
parameters: []
bindings: []
operations:
  - &ref_0
    id: receiveTicker
    title: Ticker Update
    description: Receive market ticker updates
    type: send
    messages:
      - &ref_1
        id: ticker
        contentType: application/json
        payload:
          - name: Ticker Update
            description: Market price ticker information
            type: object
            properties:
              - name: type
                type: string
                description: ticker
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: market_ticker
                    type: string
                    description: Unique market identifier
                    required: false
                  - name: market_id
                    type: string
                    description: Unique market UUID
                    required: false
                  - name: price
                    type: integer
                    description: Last traded price in cents (1-99)
                    required: false
                  - name: yes_bid
                    type: integer
                    description: Best bid price for yes side
                    required: false
                  - name: yes_ask
                    type: integer
                    description: Best ask price for yes side
                    required: false
                  - name: price_dollars
                    type: string
                    description: Last traded price in dollars
                    required: false
                  - name: yes_bid_dollars
                    type: string
                    description: Best bid price for yes side in dollars
                    required: false
                  - name: yes_ask_dollars
                    type: string
                    description: Best ask price for yes side in dollars
                    required: false
                  - name: volume
                    type: integer
                    description: >-
                      Number of individual contracts traded on the market so
                      far. YES and NO count separately
                    required: false
                  - name: volume_fp
                    type: string
                    description: Fixed-point total contracts traded (2 decimals)
                    required: false
                  - name: open_interest
                    type: integer
                    description: Number of active contracts in the market currently
                    required: false
                  - name: open_interest_fp
                    type: string
                    description: Fixed-point open interest (2 decimals)
                    required: false
                  - name: dollar_volume
                    type: integer
                    description: Number of dollars traded in the market so far
                    required: false
                  - name: dollar_open_interest
                    type: integer
                    description: Number of dollars positioned in the market currently
                    required: false
                  - name: ts
                    type: integer
                    description: Unix timestamp for when the update happened (in seconds)
                    required: false
                  - name: time
                    type: string
                    description: Timestamp for when the update happened (RFC3339)
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: ticker
              x-parser-schema-id: <anonymous-schema-81>
            sid:
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            msg:
              type: object
              required:
                - market_ticker
                - market_id
                - price
                - yes_bid
                - yes_ask
                - price_dollars
                - yes_bid_dollars
                - yes_ask_dollars
                - volume
                - volume_fp
                - open_interest
                - open_interest_fp
                - dollar_volume
                - dollar_open_interest
                - ts
                - time
              properties:
                market_ticker:
                  type: string
                  description: Unique market identifier
                  pattern: ^[A-Z0-9-]+$
                  examples:
                    - FED-23DEC-T3.00
                    - HIGHNY-22DEC23-B53.5
                  x-parser-schema-id: marketTicker
                market_id:
                  type: string
                  description: Unique market UUID
                  format: uuid
                  x-parser-schema-id: marketId
                price:
                  type: integer
                  description: Last traded price in cents (1-99)
                  minimum: 1
                  maximum: 99
                  x-parser-schema-id: <anonymous-schema-83>
                yes_bid:
                  type: integer
                  description: Best bid price for yes side
                  minimum: 1
                  maximum: 99
                  x-parser-schema-id: <anonymous-schema-84>
                yes_ask:
                  type: integer
                  description: Best ask price for yes side
                  minimum: 1
                  maximum: 99
                  x-parser-schema-id: <anonymous-schema-85>
                price_dollars:
                  type: string
                  description: Last traded price in dollars
                  x-parser-schema-id: <anonymous-schema-86>
                yes_bid_dollars:
                  type: string
                  description: Best bid price for yes side in dollars
                  x-parser-schema-id: <anonymous-schema-87>
                yes_ask_dollars:
                  type: string
                  description: Best ask price for yes side in dollars
                  x-parser-schema-id: <anonymous-schema-88>
                volume:
                  type: integer
                  description: >-
                    Number of individual contracts traded on the market so far.
                    YES and NO count separately
                  minimum: 0
                  x-parser-schema-id: <anonymous-schema-89>
                volume_fp:
                  type: string
                  description: Fixed-point total contracts traded (2 decimals)
                  x-parser-schema-id: <anonymous-schema-90>
                open_interest:
                  type: integer
                  description: Number of active contracts in the market currently
                  minimum: 0
                  x-parser-schema-id: <anonymous-schema-91>
                open_interest_fp:
                  type: string
                  description: Fixed-point open interest (2 decimals)
                  x-parser-schema-id: <anonymous-schema-92>
                dollar_volume:
                  type: integer
                  description: Number of dollars traded in the market so far
                  minimum: 0
                  x-parser-schema-id: <anonymous-schema-93>
                dollar_open_interest:
                  type: integer
                  description: Number of dollars positioned in the market currently
                  minimum: 0
                  x-parser-schema-id: <anonymous-schema-94>
                ts:
                  type: integer
                  description: Unix timestamp for when the update happened (in seconds)
                  format: int64
                  x-parser-schema-id: <anonymous-schema-95>
                time:
                  type: string
                  description: Timestamp for when the update happened (RFC3339)
                  format: date-time
                  x-parser-schema-id: <anonymous-schema-96>
              x-parser-schema-id: <anonymous-schema-82>
          x-parser-schema-id: tickerPayload
        title: Ticker Update
        description: Market price ticker information
        example: |-
          {
            "type": "ticker",
            "sid": 11,
            "msg": {
              "market_ticker": "FED-23DEC-T3.00",
              "market_id": "9b0f6b43-5b68-4f9f-9f02-9a2d1b8ac1a1",
              "price": 48,
              "yes_bid": 45,
              "yes_ask": 53,
              "price_dollars": "0.480",
              "yes_bid_dollars": "0.450",
              "yes_ask_dollars": "0.530",
              "volume": 33896,
              "volume_fp": "33896.00",
              "open_interest": 20422,
              "open_interest_fp": "20422.00",
              "dollar_volume": 16948,
              "dollar_open_interest": 10211,
              "ts": 1669149841,
              "time": "2022-11-22T20:44:01Z"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: ticker
    bindings: []
    extensions:
      - id: x-parser-unique-object-id
        value: ticker
sendOperations: []
receiveOperations:
  - *ref_0
sendMessages: []
receiveMessages:
  - *ref_1
extensions:
  - id: x-parser-unique-object-id
    value: ticker
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/multivariate-lookups.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Multivariate Lookups

> Multivariate collection lookup notifications.

**Requirements:**
- Authentication required (authenticated WebSocket connection)
- No filtering parameters; subscription is global

**Use case:** Tracking multivariate market relationships




## AsyncAPI

````yaml asyncapi.yaml multivariate
id: multivariate
title: Multivariate Lookups
description: |
  Multivariate collection lookup notifications.

  **Requirements:**
  - Authentication required (authenticated WebSocket connection)
  - No filtering parameters; subscription is global

  **Use case:** Tracking multivariate market relationships
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: multivariate
parameters: []
bindings: []
operations:
  - &ref_0
    id: receiveMultivariateLookup
    title: Multivariate Lookup
    description: Receive multivariate collection lookup notifications
    type: send
    messages:
      - &ref_1
        id: multivariateLookup
        contentType: application/json
        payload:
          - name: Multivariate Lookup
            description: Multivariate collection lookup notification
            type: object
            properties:
              - name: type
                type: string
                description: multivariate_lookup
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: collection_ticker
                    type: string
                    required: false
                  - name: event_ticker
                    type: string
                    required: false
                  - name: market_ticker
                    type: string
                    required: false
                  - name: selected_markets
                    type: array
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: multivariate_lookup
              x-parser-schema-id: <anonymous-schema-167>
            sid:
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            msg:
              type: object
              required:
                - collection_ticker
                - event_ticker
                - market_ticker
                - selected_markets
              properties:
                collection_ticker:
                  type: string
                  x-parser-schema-id: <anonymous-schema-169>
                event_ticker:
                  type: string
                  x-parser-schema-id: <anonymous-schema-170>
                market_ticker:
                  type: string
                  x-parser-schema-id: <anonymous-schema-171>
                selected_markets:
                  type: array
                  items:
                    type: object
                    required:
                      - event_ticker
                      - market_ticker
                      - side
                    properties:
                      event_ticker:
                        type: string
                        x-parser-schema-id: <anonymous-schema-174>
                      market_ticker:
                        type: string
                        x-parser-schema-id: <anonymous-schema-175>
                      side:
                        type: string
                        description: Market side
                        enum:
                          - 'yes'
                          - 'no'
                        x-parser-schema-id: marketSide
                    x-parser-schema-id: <anonymous-schema-173>
                  x-parser-schema-id: <anonymous-schema-172>
              x-parser-schema-id: <anonymous-schema-168>
          x-parser-schema-id: multivariateLookupPayload
        title: Multivariate Lookup
        description: Multivariate collection lookup notification
        example: |-
          {
            "type": "multivariate_lookup",
            "sid": 13,
            "msg": {
              "collection_ticker": "KXOSCARWINNERS-25",
              "event_ticker": "KXOSCARWINNERS-25C0CE5",
              "market_ticker": "KXOSCARWINNERS-25C0CE5-36353",
              "selected_markets": [
                {
                  "event_ticker": "KXOSCARACTO-25",
                  "market_ticker": "KXOSCARACTO-25-AB",
                  "side": "yes"
                },
                {
                  "event_ticker": "KXOSCARACTR-25",
                  "market_ticker": "KXOSCARACTR-25-DM",
                  "side": "yes"
                }
              ]
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: multivariateLookup
    bindings: []
    extensions:
      - id: x-parser-unique-object-id
        value: multivariate
sendOperations: []
receiveOperations:
  - *ref_0
sendMessages: []
receiveMessages:
  - *ref_1
extensions:
  - id: x-parser-unique-object-id
    value: multivariate
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/order-group-updates.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Order Group Updates

> Real-time order group lifecycle and limit updates. Requires authentication.

**Requirements:**
- Authentication required
- Market specification ignored
- Updates sent when order groups are created, triggered, reset, deleted, or have limits updated

**Use case:** Tracking order group lifecycle and limits




## AsyncAPI

````yaml asyncapi.yaml order_group_updates
id: order_group_updates
title: Order Group Updates
description: >
  Real-time order group lifecycle and limit updates. Requires authentication.


  **Requirements:**

  - Authentication required

  - Market specification ignored

  - Updates sent when order groups are created, triggered, reset, deleted, or
  have limits updated


  **Use case:** Tracking order group lifecycle and limits
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: order_group_updates
parameters: []
bindings: []
operations:
  - &ref_0
    id: receiveOrderGroupUpdates
    title: Order Group Updates
    description: Receive order group lifecycle and limit updates
    type: send
    messages:
      - &ref_1
        id: orderGroupUpdates
        contentType: application/json
        payload:
          - name: Order Group Updates
            description: Order group lifecycle and limit updates for authenticated user
            type: object
            properties:
              - name: type
                type: string
                description: order_group_updates
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: seq
                type: integer
                description: >-
                  Sequential number that should be checked if you want to
                  guarantee you received all the messages. Used for
                  snapshot/delta consistency
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: event_type
                    type: string
                    description: Order group event type
                    required: false
                  - name: order_group_id
                    type: string
                    description: Order group identifier
                    required: false
                  - name: contracts_limit_fp
                    type: string
                    description: >-
                      Updated contracts limit in fixed-point (2 decimals).
                      Present for "created" and "limit_updated" events only.
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - seq
            - msg
          properties:
            type:
              type: string
              const: order_group_updates
              x-parser-schema-id: <anonymous-schema-253>
            sid:
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            seq:
              type: integer
              description: >-
                Sequential number that should be checked if you want to
                guarantee you received all the messages. Used for snapshot/delta
                consistency
              minimum: 1
              x-parser-schema-id: sequenceNumber
            msg:
              type: object
              required:
                - event_type
                - order_group_id
              properties:
                event_type:
                  type: string
                  description: Order group event type
                  enum:
                    - created
                    - triggered
                    - reset
                    - deleted
                    - limit_updated
                  x-parser-schema-id: <anonymous-schema-255>
                order_group_id:
                  type: string
                  description: Order group identifier
                  x-parser-schema-id: <anonymous-schema-256>
                contracts_limit_fp:
                  type: string
                  description: >-
                    Updated contracts limit in fixed-point (2 decimals). Present
                    for "created" and "limit_updated" events only.
                  x-parser-schema-id: <anonymous-schema-257>
              x-parser-schema-id: <anonymous-schema-254>
          x-parser-schema-id: orderGroupUpdatesPayload
        title: Order Group Updates
        description: Order group lifecycle and limit updates for authenticated user
        example: |-
          {
            "type": "order_group_updates",
            "sid": 21,
            "seq": 7,
            "msg": {
              "event_type": "limit_updated",
              "order_group_id": "og_123",
              "contracts_limit_fp": "150.00"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: orderGroupUpdates
    bindings: []
    extensions:
      - id: x-parser-unique-object-id
        value: order_group_updates
sendOperations: []
receiveOperations:
  - *ref_0
sendMessages: []
receiveMessages:
  - *ref_1
extensions:
  - id: x-parser-unique-object-id
    value: order_group_updates
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/orderbook-updates.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Orderbook Updates

> Real-time orderbook price level changes. Provides incremental updates to maintain a live orderbook.

**Requirements:**
- Authentication required
- Market specification required:
  - Use `market_ticker` (string) for a single market
  - Use `market_tickers` (array of strings) for multiple markets
  - `market_id`/`market_ids` are not supported for this channel
- Sends `orderbook_snapshot` first, then incremental `orderbook_delta` updates

**Use case:** Building and maintaining a real-time orderbook




## AsyncAPI

````yaml asyncapi.yaml orderbook_delta
id: orderbook_delta
title: Orderbook Updates
description: >
  Real-time orderbook price level changes. Provides incremental updates to
  maintain a live orderbook.


  **Requirements:**

  - Authentication required

  - Market specification required:
    - Use `market_ticker` (string) for a single market
    - Use `market_tickers` (array of strings) for multiple markets
    - `market_id`/`market_ids` are not supported for this channel
  - Sends `orderbook_snapshot` first, then incremental `orderbook_delta` updates


  **Use case:** Building and maintaining a real-time orderbook
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: orderbook_delta
parameters: []
bindings: []
operations:
  - &ref_5
    id: receiveOrderbookSnapshot
    title: Orderbook Snapshot
    description: Receive complete orderbook state
    type: send
    messages:
      - &ref_7
        id: orderbookSnapshot
        contentType: application/json
        payload:
          - name: Orderbook Snapshot
            description: Complete view of the order book's aggregated price levels
            type: object
            properties:
              - name: type
                type: string
                description: orderbook_snapshot
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: seq
                type: integer
                description: >-
                  Sequential number that should be checked if you want to
                  guarantee you received all the messages. Used for
                  snapshot/delta consistency
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: market_ticker
                    type: string
                    description: Unique market identifier
                    required: false
                  - name: market_id
                    type: string
                    description: Unique market UUID
                    required: false
                  - name: 'yes'
                    type: array
                    description: >
                      Optional - This key will not exist if there are no Yes
                      offers in the orderbook.

                      In case it exists there will be many price levels, so for
                      compactness, every element in the list is

                      an array with two integers, not an object.

                      Format: [price_in_cents, number_of_resting_contracts]
                    required: false
                  - name: yes_dollars
                    type: array
                    description: >
                      Optional - This key will not exist if there are no Yes
                      offers in the orderbook.

                      Same as "yes" but with price in dollars.

                      Format: [price_in_dollars, number_of_resting_contracts]
                    required: false
                  - name: yes_dollars_fp
                    type: array
                    description: >
                      Optional - This key will not exist if there are no Yes
                      offers in the orderbook.

                      Same as "yes_dollars" but with contract counts in
                      fixed-point (2 decimals).

                      Format: [price_in_dollars, contract_count_fp]
                    required: false
                  - name: 'no'
                    type: array
                    description: >
                      Optional - Same format as "yes" but for the NO side of the
                      orderbook.

                      This key will not exist if there are no No offers in the
                      orderbook.

                      Format: [price_in_cents, number_of_resting_contracts]
                    required: false
                  - name: no_dollars
                    type: array
                    description: >
                      Optional - Same format as "yes_dollars" but for the NO
                      side of the orderbook.

                      This key will not exist if there are no No offers in the
                      orderbook.

                      Format: [price_in_dollars, number_of_resting_contracts]
                    required: false
                  - name: no_dollars_fp
                    type: array
                    description: >
                      Optional - Same format as "yes_dollars_fp" but for the NO
                      side of the orderbook.

                      This key will not exist if there are no No offers in the
                      orderbook.

                      Format: [price_in_dollars, contract_count_fp]
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - seq
            - msg
          properties:
            type:
              type: string
              const: orderbook_snapshot
              x-parser-schema-id: <anonymous-schema-48>
            sid: &ref_0
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            seq: &ref_1
              type: integer
              description: >-
                Sequential number that should be checked if you want to
                guarantee you received all the messages. Used for snapshot/delta
                consistency
              minimum: 1
              x-parser-schema-id: sequenceNumber
            msg:
              type: object
              required:
                - market_ticker
                - market_id
              properties:
                market_ticker: &ref_2
                  type: string
                  description: Unique market identifier
                  pattern: ^[A-Z0-9-]+$
                  examples:
                    - FED-23DEC-T3.00
                    - HIGHNY-22DEC23-B53.5
                  x-parser-schema-id: marketTicker
                market_id: &ref_3
                  type: string
                  description: Unique market UUID
                  format: uuid
                  x-parser-schema-id: marketId
                'yes':
                  type: array
                  description: >
                    Optional - This key will not exist if there are no Yes
                    offers in the orderbook.

                    In case it exists there will be many price levels, so for
                    compactness, every element in the list is

                    an array with two integers, not an object.

                    Format: [price_in_cents, number_of_resting_contracts]
                  items:
                    type: array
                    items:
                      type: integer
                      x-parser-schema-id: <anonymous-schema-52>
                    minItems: 2
                    maxItems: 2
                    x-parser-schema-id: <anonymous-schema-51>
                  x-parser-schema-id: <anonymous-schema-50>
                yes_dollars:
                  type: array
                  description: >
                    Optional - This key will not exist if there are no Yes
                    offers in the orderbook.

                    Same as "yes" but with price in dollars.

                    Format: [price_in_dollars, number_of_resting_contracts]
                  items:
                    type: array
                    items:
                      oneOf:
                        - type: string
                          x-parser-schema-id: <anonymous-schema-56>
                        - type: integer
                          x-parser-schema-id: <anonymous-schema-57>
                      x-parser-schema-id: <anonymous-schema-55>
                    minItems: 2
                    maxItems: 2
                    x-parser-schema-id: <anonymous-schema-54>
                  x-parser-schema-id: <anonymous-schema-53>
                yes_dollars_fp:
                  type: array
                  description: >
                    Optional - This key will not exist if there are no Yes
                    offers in the orderbook.

                    Same as "yes_dollars" but with contract counts in
                    fixed-point (2 decimals).

                    Format: [price_in_dollars, contract_count_fp]
                  items:
                    type: array
                    items:
                      type: string
                      x-parser-schema-id: <anonymous-schema-60>
                    minItems: 2
                    maxItems: 2
                    x-parser-schema-id: <anonymous-schema-59>
                  x-parser-schema-id: <anonymous-schema-58>
                'no':
                  type: array
                  description: >
                    Optional - Same format as "yes" but for the NO side of the
                    orderbook.

                    This key will not exist if there are no No offers in the
                    orderbook.

                    Format: [price_in_cents, number_of_resting_contracts]
                  items:
                    type: array
                    items:
                      type: integer
                      x-parser-schema-id: <anonymous-schema-63>
                    minItems: 2
                    maxItems: 2
                    x-parser-schema-id: <anonymous-schema-62>
                  x-parser-schema-id: <anonymous-schema-61>
                no_dollars:
                  type: array
                  description: >
                    Optional - Same format as "yes_dollars" but for the NO side
                    of the orderbook.

                    This key will not exist if there are no No offers in the
                    orderbook.

                    Format: [price_in_dollars, number_of_resting_contracts]
                  items:
                    type: array
                    items:
                      oneOf:
                        - type: string
                          x-parser-schema-id: <anonymous-schema-67>
                        - type: integer
                          x-parser-schema-id: <anonymous-schema-68>
                      x-parser-schema-id: <anonymous-schema-66>
                    minItems: 2
                    maxItems: 2
                    x-parser-schema-id: <anonymous-schema-65>
                  x-parser-schema-id: <anonymous-schema-64>
                no_dollars_fp:
                  type: array
                  description: >
                    Optional - Same format as "yes_dollars_fp" but for the NO
                    side of the orderbook.

                    This key will not exist if there are no No offers in the
                    orderbook.

                    Format: [price_in_dollars, contract_count_fp]
                  items:
                    type: array
                    items:
                      type: string
                      x-parser-schema-id: <anonymous-schema-71>
                    minItems: 2
                    maxItems: 2
                    x-parser-schema-id: <anonymous-schema-70>
                  x-parser-schema-id: <anonymous-schema-69>
              x-parser-schema-id: <anonymous-schema-49>
          x-parser-schema-id: orderbookSnapshotPayload
        title: Orderbook Snapshot
        description: Complete view of the order book's aggregated price levels
        example: |-
          {
            "type": "orderbook_snapshot",
            "sid": 2,
            "seq": 2,
            "msg": {
              "market_ticker": "FED-23DEC-T3.00",
              "market_id": "9b0f6b43-5b68-4f9f-9f02-9a2d1b8ac1a1",
              "yes": [
                [
                  8,
                  300
                ],
                [
                  22,
                  333
                ]
              ],
              "yes_dollars": [
                [
                  "0.080",
                  300
                ],
                [
                  "0.220",
                  333
                ]
              ],
              "yes_dollars_fp": [
                [
                  "0.0800",
                  "300.00"
                ],
                [
                  "0.2200",
                  "333.00"
                ]
              ],
              "no": [
                [
                  54,
                  20
                ],
                [
                  56,
                  146
                ]
              ],
              "no_dollars": [
                [
                  "0.540",
                  20
                ],
                [
                  "0.560",
                  146
                ]
              ],
              "no_dollars_fp": [
                [
                  "0.5400",
                  "20.00"
                ],
                [
                  "0.5600",
                  "146.00"
                ]
              ]
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: orderbookSnapshot
    bindings: []
    extensions: &ref_4
      - id: x-parser-unique-object-id
        value: orderbook_delta
  - &ref_6
    id: receiveOrderbookDelta
    title: Orderbook Update
    description: Receive incremental orderbook changes
    type: send
    messages:
      - &ref_8
        id: orderbookDelta
        contentType: application/json
        payload:
          - name: Orderbook Delta
            description: Update to be applied to the current order book view
            type: object
            properties:
              - name: type
                type: string
                description: orderbook_delta
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: seq
                type: integer
                description: >-
                  Sequential number that should be checked if you want to
                  guarantee you received all the messages. Used for
                  snapshot/delta consistency
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: market_ticker
                    type: string
                    description: Unique market identifier
                    required: false
                  - name: market_id
                    type: string
                    description: Unique market UUID
                    required: false
                  - name: price
                    type: integer
                    description: Price level in cents (1-99)
                    required: false
                  - name: price_dollars
                    type: string
                    description: Price level in dollars
                    required: false
                  - name: delta
                    type: integer
                    description: Change in contracts (positive=increase, negative=decrease)
                    required: false
                  - name: delta_fp
                    type: string
                    description: Fixed-point contract delta (2 decimals)
                    required: false
                  - name: side
                    type: string
                    description: Market side
                    required: false
                  - name: client_order_id
                    type: string
                    description: >
                      Optional - Present only when you caused this orderbook
                      change.

                      Contains the client_order_id of your order that triggered
                      this delta.
                    required: false
                  - name: subaccount
                    type: integer
                    description: >
                      Optional - Present only when you caused this orderbook
                      change and are using subaccounts.

                      Contains the subaccount number of your order that
                      triggered this delta.
                    required: false
                  - name: ts
                    type: string
                    description: >-
                      Optional - Timestamp for when the orderbook change was
                      recorded (RFC3339)
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - seq
            - msg
          properties:
            type:
              type: string
              const: orderbook_delta
              x-parser-schema-id: <anonymous-schema-72>
            sid: *ref_0
            seq: *ref_1
            msg:
              type: object
              required:
                - market_ticker
                - market_id
                - price
                - price_dollars
                - delta
                - delta_fp
                - side
              properties:
                market_ticker: *ref_2
                market_id: *ref_3
                price:
                  type: integer
                  description: Price level in cents (1-99)
                  minimum: 1
                  maximum: 99
                  x-parser-schema-id: <anonymous-schema-74>
                price_dollars:
                  type: string
                  description: Price level in dollars
                  x-parser-schema-id: <anonymous-schema-75>
                delta:
                  type: integer
                  description: Change in contracts (positive=increase, negative=decrease)
                  x-parser-schema-id: <anonymous-schema-76>
                delta_fp:
                  type: string
                  description: Fixed-point contract delta (2 decimals)
                  x-parser-schema-id: <anonymous-schema-77>
                side:
                  type: string
                  description: Market side
                  enum:
                    - 'yes'
                    - 'no'
                  x-parser-schema-id: marketSide
                client_order_id:
                  type: string
                  description: >
                    Optional - Present only when you caused this orderbook
                    change.

                    Contains the client_order_id of your order that triggered
                    this delta.
                  x-parser-schema-id: <anonymous-schema-78>
                subaccount:
                  type: integer
                  description: >
                    Optional - Present only when you caused this orderbook
                    change and are using subaccounts.

                    Contains the subaccount number of your order that triggered
                    this delta.
                  x-parser-schema-id: <anonymous-schema-79>
                ts:
                  type: string
                  description: >-
                    Optional - Timestamp for when the orderbook change was
                    recorded (RFC3339)
                  format: date-time
                  x-parser-schema-id: <anonymous-schema-80>
              x-parser-schema-id: <anonymous-schema-73>
          x-parser-schema-id: orderbookDeltaPayload
        title: Orderbook Delta
        description: Update to be applied to the current order book view
        example: |-
          {
            "type": "orderbook_delta",
            "sid": 2,
            "seq": 3,
            "msg": {
              "market_ticker": "FED-23DEC-T3.00",
              "market_id": "9b0f6b43-5b68-4f9f-9f02-9a2d1b8ac1a1",
              "price": 96,
              "price_dollars": "0.960",
              "delta": -54,
              "delta_fp": "-54.00",
              "side": "yes",
              "ts": "2022-11-22T20:44:01Z"
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: orderbookDelta
    bindings: []
    extensions: *ref_4
sendOperations: []
receiveOperations:
  - *ref_5
  - *ref_6
sendMessages: []
receiveMessages:
  - *ref_7
  - *ref_8
extensions:
  - id: x-parser-unique-object-id
    value: orderbook_delta
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/public-trades.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Public Trades

> Public trade notifications when trades occur.

**Requirements:**
- Authentication required (authenticated WebSocket connection)
- Market specification optional (omit to receive all trades)
- Updates sent immediately after trade execution

**Use case:** Trade feed, volume analysis




## AsyncAPI

````yaml asyncapi.yaml trade
id: trade
title: Public Trades
description: |
  Public trade notifications when trades occur.

  **Requirements:**
  - Authentication required (authenticated WebSocket connection)
  - Market specification optional (omit to receive all trades)
  - Updates sent immediately after trade execution

  **Use case:** Trade feed, volume analysis
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: trade
parameters: []
bindings: []
operations:
  - &ref_0
    id: receiveTrade
    title: Trade Update
    description: Receive public trade notifications
    type: send
    messages:
      - &ref_1
        id: trade
        contentType: application/json
        payload:
          - name: Trade Update
            description: Public trade information
            type: object
            properties:
              - name: type
                type: string
                description: trade
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: trade_id
                    type: string
                    description: Unique identifier for the trade
                    required: false
                  - name: market_ticker
                    type: string
                    description: Unique market identifier
                    required: false
                  - name: yes_price
                    type: integer
                    description: Yes side price (1-99)
                    required: false
                  - name: yes_price_dollars
                    type: string
                    description: Yes side price in dollars
                    required: false
                  - name: no_price
                    type: integer
                    description: No side price (1-99)
                    required: false
                  - name: no_price_dollars
                    type: string
                    description: No side price in dollars
                    required: false
                  - name: count
                    type: integer
                    description: Number of contracts traded
                    required: false
                  - name: count_fp
                    type: string
                    description: Fixed-point contracts traded (2 decimals)
                    required: false
                  - name: taker_side
                    type: string
                    description: Market side
                    required: false
                  - name: ts
                    type: integer
                    description: Unix timestamp in seconds
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: trade
              x-parser-schema-id: <anonymous-schema-97>
            sid:
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            msg:
              type: object
              required:
                - trade_id
                - market_ticker
                - yes_price
                - yes_price_dollars
                - no_price
                - no_price_dollars
                - count
                - count_fp
                - taker_side
                - ts
              properties:
                trade_id:
                  type: string
                  description: Unique identifier for the trade
                  format: uuid
                  x-parser-schema-id: <anonymous-schema-99>
                market_ticker:
                  type: string
                  description: Unique market identifier
                  pattern: ^[A-Z0-9-]+$
                  examples:
                    - FED-23DEC-T3.00
                    - HIGHNY-22DEC23-B53.5
                  x-parser-schema-id: marketTicker
                yes_price:
                  type: integer
                  description: Yes side price (1-99)
                  minimum: 1
                  maximum: 99
                  x-parser-schema-id: <anonymous-schema-100>
                yes_price_dollars:
                  type: string
                  description: Yes side price in dollars
                  x-parser-schema-id: <anonymous-schema-101>
                no_price:
                  type: integer
                  description: No side price (1-99)
                  minimum: 1
                  maximum: 99
                  x-parser-schema-id: <anonymous-schema-102>
                no_price_dollars:
                  type: string
                  description: No side price in dollars
                  x-parser-schema-id: <anonymous-schema-103>
                count:
                  type: integer
                  description: Number of contracts traded
                  minimum: 1
                  x-parser-schema-id: <anonymous-schema-104>
                count_fp:
                  type: string
                  description: Fixed-point contracts traded (2 decimals)
                  x-parser-schema-id: <anonymous-schema-105>
                taker_side:
                  type: string
                  description: Market side
                  enum:
                    - 'yes'
                    - 'no'
                  x-parser-schema-id: marketSide
                ts:
                  type: integer
                  description: Unix timestamp in seconds
                  format: int64
                  x-parser-schema-id: <anonymous-schema-106>
              x-parser-schema-id: <anonymous-schema-98>
          x-parser-schema-id: tradePayload
        title: Trade Update
        description: Public trade information
        example: |-
          {
            "type": "trade",
            "sid": 11,
            "msg": {
              "trade_id": "d91bc706-ee49-470d-82d8-11418bda6fed",
              "market_ticker": "HIGHNY-22DEC23-B53.5",
              "yes_price": 36,
              "yes_price_dollars": "0.360",
              "no_price": 64,
              "no_price_dollars": "0.640",
              "count": 136,
              "count_fp": "136.00",
              "taker_side": "no",
              "ts": 1669149841
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: trade
    bindings: []
    extensions:
      - id: x-parser-unique-object-id
        value: trade
sendOperations: []
receiveOperations:
  - *ref_0
sendMessages: []
receiveMessages:
  - *ref_1
extensions:
  - id: x-parser-unique-object-id
    value: trade
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/user-fills.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# User Fills

> Your order fill notifications. Requires authentication.

**Requirements:**
- Authentication required
- Market specification optional via `market_ticker`/`market_tickers` (omit to receive all your fills)
- Supports `update_subscription` with `add_markets` / `delete_markets`
- Updates sent immediately when your orders are filled

**Use case:** Tracking your trading activity




## AsyncAPI

````yaml asyncapi.yaml fill
id: fill
title: User Fills
description: >
  Your order fill notifications. Requires authentication.


  **Requirements:**

  - Authentication required

  - Market specification optional via `market_ticker`/`market_tickers` (omit to
  receive all your fills)

  - Supports `update_subscription` with `add_markets` / `delete_markets`

  - Updates sent immediately when your orders are filled


  **Use case:** Tracking your trading activity
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: fill
parameters: []
bindings: []
operations:
  - &ref_1
    id: receiveFill
    title: Fill Notification
    description: Receive notifications for your fills
    type: send
    messages:
      - &ref_2
        id: fill
        contentType: application/json
        payload:
          - name: Fill Update
            description: Private fill information for authenticated user
            type: object
            properties:
              - name: type
                type: string
                description: fill
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: trade_id
                    type: string
                    description: >-
                      Unique identifier for fills. This is what you use to
                      differentiate fills
                    required: false
                  - name: order_id
                    type: string
                    description: >-
                      Unique identifier for orders. This is what you use to
                      differentiate fills for different orders
                    required: false
                  - name: market_ticker
                    type: string
                    description: Unique market identifier
                    required: false
                  - name: is_taker
                    type: boolean
                    description: If you were a taker on this fill
                    required: false
                  - name: side
                    type: string
                    description: Market side
                    required: false
                  - name: yes_price
                    type: integer
                    description: >-
                      Price for the yes side of the fill. Between 1 and 99
                      (inclusive)
                    required: false
                  - name: yes_price_dollars
                    type: string
                    description: Price for the yes side of the fill in dollars
                    required: false
                  - name: count
                    type: integer
                    description: Number of contracts filled
                    required: false
                  - name: count_fp
                    type: string
                    description: Fixed-point contracts filled (2 decimals)
                    required: false
                  - name: fee_cost
                    type: string
                    description: Exchange fee paid for this fill in fixed-point dollars
                    required: false
                  - name: action
                    type: string
                    description: Order action type
                    required: false
                  - name: ts
                    type: integer
                    description: Unix timestamp for when the update happened (in seconds)
                    required: false
                  - name: client_order_id
                    type: string
                    description: Optional client-provided order ID
                    required: false
                  - name: post_position
                    type: integer
                    description: Position after the fill
                    required: false
                  - name: post_position_fp
                    type: string
                    description: Fixed-point position after the fill (2 decimals)
                    required: false
                  - name: purchased_side
                    type: string
                    description: Market side
                    required: false
                  - name: subaccount
                    type: integer
                    description: Optional subaccount number for the fill
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: fill
              x-parser-schema-id: <anonymous-schema-107>
            sid:
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            msg:
              type: object
              required:
                - trade_id
                - order_id
                - market_ticker
                - is_taker
                - side
                - yes_price
                - yes_price_dollars
                - count
                - count_fp
                - fee_cost
                - action
                - ts
                - post_position
                - post_position_fp
                - purchased_side
              properties:
                trade_id:
                  type: string
                  description: >-
                    Unique identifier for fills. This is what you use to
                    differentiate fills
                  format: uuid
                  x-parser-schema-id: <anonymous-schema-109>
                order_id:
                  type: string
                  description: >-
                    Unique identifier for orders. This is what you use to
                    differentiate fills for different orders
                  format: uuid
                  x-parser-schema-id: <anonymous-schema-110>
                market_ticker:
                  type: string
                  description: Unique market identifier
                  pattern: ^[A-Z0-9-]+$
                  examples:
                    - FED-23DEC-T3.00
                    - HIGHNY-22DEC23-B53.5
                  x-parser-schema-id: marketTicker
                is_taker:
                  type: boolean
                  description: If you were a taker on this fill
                  x-parser-schema-id: <anonymous-schema-111>
                side: &ref_0
                  type: string
                  description: Market side
                  enum:
                    - 'yes'
                    - 'no'
                  x-parser-schema-id: marketSide
                yes_price:
                  type: integer
                  description: >-
                    Price for the yes side of the fill. Between 1 and 99
                    (inclusive)
                  minimum: 1
                  maximum: 99
                  x-parser-schema-id: <anonymous-schema-112>
                yes_price_dollars:
                  type: string
                  description: Price for the yes side of the fill in dollars
                  x-parser-schema-id: <anonymous-schema-113>
                count:
                  type: integer
                  description: Number of contracts filled
                  minimum: 1
                  x-parser-schema-id: <anonymous-schema-114>
                count_fp:
                  type: string
                  description: Fixed-point contracts filled (2 decimals)
                  x-parser-schema-id: <anonymous-schema-115>
                fee_cost:
                  type: string
                  description: Exchange fee paid for this fill in fixed-point dollars
                  x-parser-schema-id: <anonymous-schema-116>
                action:
                  type: string
                  description: Order action type
                  enum:
                    - buy
                    - sell
                  x-parser-schema-id: orderAction
                ts:
                  type: integer
                  description: Unix timestamp for when the update happened (in seconds)
                  format: int64
                  x-parser-schema-id: <anonymous-schema-117>
                client_order_id:
                  type: string
                  description: Optional client-provided order ID
                  x-parser-schema-id: <anonymous-schema-118>
                post_position:
                  type: integer
                  description: Position after the fill
                  x-parser-schema-id: <anonymous-schema-119>
                post_position_fp:
                  type: string
                  description: Fixed-point position after the fill (2 decimals)
                  x-parser-schema-id: <anonymous-schema-120>
                purchased_side: *ref_0
                subaccount:
                  type: integer
                  description: Optional subaccount number for the fill
                  x-parser-schema-id: <anonymous-schema-121>
              x-parser-schema-id: <anonymous-schema-108>
          x-parser-schema-id: fillPayload
        title: Fill Update
        description: Private fill information for authenticated user
        example: |-
          {
            "type": "fill",
            "sid": 13,
            "msg": {
              "trade_id": "d91bc706-ee49-470d-82d8-11418bda6fed",
              "order_id": "ee587a1c-8b87-4dcf-b721-9f6f790619fa",
              "market_ticker": "HIGHNY-22DEC23-B53.5",
              "is_taker": true,
              "side": "yes",
              "yes_price": 75,
              "yes_price_dollars": "0.750",
              "count": 278,
              "count_fp": "278.00",
              "action": "buy",
              "ts": 1671899397,
              "post_position": 500,
              "post_position_fp": "500.00",
              "purchased_side": "yes",
              "subaccount": 3
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: fill
    bindings: []
    extensions:
      - id: x-parser-unique-object-id
        value: fill
sendOperations: []
receiveOperations:
  - *ref_1
sendMessages: []
receiveMessages:
  - *ref_2
extensions:
  - id: x-parser-unique-object-id
    value: fill
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### /websockets/user-orders.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# User Orders

> Real-time order created and updated notifications. Requires authentication.

**Requirements:**
- Authentication required
- Market specification optional via `market_tickers` (omit to receive all orders)
- Supports `update_subscription` with `add_markets` / `delete_markets` actions
- Updates sent when your orders are created, filled, canceled, or otherwise updated

**Use case:** Tracking your resting orders, fills, and cancellations in real time




## AsyncAPI

````yaml asyncapi.yaml user_orders
id: user_orders
title: User Orders
description: >
  Real-time order created and updated notifications. Requires authentication.


  **Requirements:**

  - Authentication required

  - Market specification optional via `market_tickers` (omit to receive all
  orders)

  - Supports `update_subscription` with `add_markets` / `delete_markets` actions

  - Updates sent when your orders are created, filled, canceled, or otherwise
  updated


  **Use case:** Tracking your resting orders, fills, and cancellations in real
  time
servers:
  - id: production
    protocol: wss
    host: api.elections.kalshi.com
    bindings: []
    variables: []
address: user_orders
parameters: []
bindings: []
operations:
  - &ref_0
    id: receiveUserOrder
    title: User Order Update
    description: Receive notifications for your order creates and updates
    type: send
    messages:
      - &ref_1
        id: userOrder
        contentType: application/json
        payload:
          - name: User Order Update
            description: Real-time order updates for authenticated user
            type: object
            properties:
              - name: type
                type: string
                description: user_order
                required: true
              - name: sid
                type: integer
                description: >-
                  Server-generated subscription identifier (sid) used to
                  identify the channel
                required: true
              - name: msg
                type: object
                required: true
                properties:
                  - name: order_id
                    type: string
                    description: Unique order identifier
                    required: false
                  - name: user_id
                    type: string
                    description: User identifier
                    required: false
                  - name: ticker
                    type: string
                    description: Unique market identifier
                    required: false
                  - name: status
                    type: string
                    description: Current order status
                    required: false
                  - name: side
                    type: string
                    description: Market side
                    required: false
                  - name: yes_price_dollars
                    type: string
                    description: Yes price in fixed-point dollars (4 decimals)
                    required: false
                  - name: fill_count_fp
                    type: string
                    description: Number of contracts filled in fixed-point (2 decimals)
                    required: false
                  - name: remaining_count_fp
                    type: string
                    description: Number of contracts remaining in fixed-point (2 decimals)
                    required: false
                  - name: initial_count_fp
                    type: string
                    description: Initial number of contracts in fixed-point (2 decimals)
                    required: false
                  - name: taker_fill_cost_dollars
                    type: string
                    description: Taker fill cost in fixed-point dollars (4 decimals)
                    required: false
                  - name: maker_fill_cost_dollars
                    type: string
                    description: Maker fill cost in fixed-point dollars (4 decimals)
                    required: false
                  - name: taker_fees_dollars
                    type: string
                    description: >-
                      Taker fees in fixed-point dollars (4 decimals). Omitted
                      when zero.
                    required: false
                  - name: maker_fees_dollars
                    type: string
                    description: >-
                      Maker fees in fixed-point dollars (4 decimals). Omitted
                      when zero.
                    required: false
                  - name: client_order_id
                    type: string
                    description: Client-provided order identifier
                    required: false
                  - name: order_group_id
                    type: string
                    description: Order group identifier, if applicable
                    required: false
                  - name: self_trade_prevention_type
                    type: string
                    description: Self-trade prevention type
                    required: false
                  - name: created_time
                    type: string
                    description: Order creation time in RFC 3339 format
                    required: false
                  - name: last_update_time
                    type: string
                    description: Last update time in RFC 3339 format
                    required: false
                  - name: expiration_time
                    type: string
                    description: Order expiration time in RFC 3339 format
                    required: false
                  - name: subaccount_number
                    type: integer
                    description: Subaccount number (0 for primary, 1-32 for subaccounts)
                    required: false
        headers: []
        jsonPayloadSchema:
          type: object
          required:
            - type
            - sid
            - msg
          properties:
            type:
              type: string
              const: user_order
              x-parser-schema-id: <anonymous-schema-258>
            sid:
              type: integer
              description: >-
                Server-generated subscription identifier (sid) used to identify
                the channel
              minimum: 1
              x-parser-schema-id: subscriptionId
            msg:
              type: object
              required:
                - order_id
                - user_id
                - ticker
                - status
                - side
                - yes_price_dollars
                - fill_count_fp
                - remaining_count_fp
                - initial_count_fp
                - taker_fill_cost_dollars
                - maker_fill_cost_dollars
                - client_order_id
                - created_time
              properties:
                order_id:
                  type: string
                  description: Unique order identifier
                  format: uuid
                  x-parser-schema-id: <anonymous-schema-260>
                user_id:
                  type: string
                  description: User identifier
                  format: uuid
                  x-parser-schema-id: <anonymous-schema-261>
                ticker:
                  type: string
                  description: Unique market identifier
                  pattern: ^[A-Z0-9-]+$
                  examples:
                    - FED-23DEC-T3.00
                    - HIGHNY-22DEC23-B53.5
                  x-parser-schema-id: marketTicker
                status:
                  type: string
                  description: Current order status
                  enum:
                    - resting
                    - canceled
                    - executed
                  x-parser-schema-id: <anonymous-schema-262>
                side:
                  type: string
                  description: Market side
                  enum:
                    - 'yes'
                    - 'no'
                  x-parser-schema-id: marketSide
                yes_price_dollars:
                  type: string
                  description: Yes price in fixed-point dollars (4 decimals)
                  x-parser-schema-id: <anonymous-schema-263>
                fill_count_fp:
                  type: string
                  description: Number of contracts filled in fixed-point (2 decimals)
                  x-parser-schema-id: <anonymous-schema-264>
                remaining_count_fp:
                  type: string
                  description: Number of contracts remaining in fixed-point (2 decimals)
                  x-parser-schema-id: <anonymous-schema-265>
                initial_count_fp:
                  type: string
                  description: Initial number of contracts in fixed-point (2 decimals)
                  x-parser-schema-id: <anonymous-schema-266>
                taker_fill_cost_dollars:
                  type: string
                  description: Taker fill cost in fixed-point dollars (4 decimals)
                  x-parser-schema-id: <anonymous-schema-267>
                maker_fill_cost_dollars:
                  type: string
                  description: Maker fill cost in fixed-point dollars (4 decimals)
                  x-parser-schema-id: <anonymous-schema-268>
                taker_fees_dollars:
                  type: string
                  description: >-
                    Taker fees in fixed-point dollars (4 decimals). Omitted when
                    zero.
                  x-parser-schema-id: <anonymous-schema-269>
                maker_fees_dollars:
                  type: string
                  description: >-
                    Maker fees in fixed-point dollars (4 decimals). Omitted when
                    zero.
                  x-parser-schema-id: <anonymous-schema-270>
                client_order_id:
                  type: string
                  description: Client-provided order identifier
                  x-parser-schema-id: <anonymous-schema-271>
                order_group_id:
                  type: string
                  description: Order group identifier, if applicable
                  x-parser-schema-id: <anonymous-schema-272>
                self_trade_prevention_type:
                  type: string
                  description: Self-trade prevention type
                  enum:
                    - taker_at_cross
                    - maker
                  x-parser-schema-id: <anonymous-schema-273>
                created_time:
                  type: string
                  description: Order creation time in RFC 3339 format
                  format: date-time
                  x-parser-schema-id: <anonymous-schema-274>
                last_update_time:
                  type: string
                  description: Last update time in RFC 3339 format
                  format: date-time
                  x-parser-schema-id: <anonymous-schema-275>
                expiration_time:
                  type: string
                  description: Order expiration time in RFC 3339 format
                  format: date-time
                  x-parser-schema-id: <anonymous-schema-276>
                subaccount_number:
                  type: integer
                  description: Subaccount number (0 for primary, 1-32 for subaccounts)
                  x-parser-schema-id: <anonymous-schema-277>
              x-parser-schema-id: <anonymous-schema-259>
          x-parser-schema-id: userOrderPayload
        title: User Order Update
        description: Real-time order updates for authenticated user
        example: |-
          {
            "type": "user_order",
            "sid": 22,
            "msg": {
              "order_id": "ee587a1c-8b87-4dcf-b721-9f6f790619fa",
              "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
              "ticker": "FED-23DEC-T3.00",
              "status": "resting",
              "side": "yes",
              "yes_price_dollars": "0.3500",
              "fill_count_fp": "0.00",
              "remaining_count_fp": "10.00",
              "initial_count_fp": "10.00",
              "taker_fill_cost_dollars": "0.0000",
              "maker_fill_cost_dollars": "0.0000",
              "client_order_id": "my-order-1",
              "order_group_id": "og_123",
              "self_trade_prevention_type": "taker_at_cross",
              "created_time": "2024-12-01T10:00:00Z",
              "expiration_time": "2024-12-01T11:00:00Z",
              "subaccount_number": 0
            }
          }
        bindings: []
        extensions:
          - id: x-parser-unique-object-id
            value: userOrder
    bindings: []
    extensions:
      - id: x-parser-unique-object-id
        value: user_orders
sendOperations: []
receiveOperations:
  - *ref_0
sendMessages: []
receiveMessages:
  - *ref_1
extensions:
  - id: x-parser-unique-object-id
    value: user_orders
securitySchemes:
  - id: apiKey
    name: apiKey
    type: apiKey
    description: |
      API key authentication required for WebSocket connections.
      The API key should be provided during the WebSocket handshake.
    in: user
    extensions: []

````

### FIX

+----+----------------------------+
| No | Page                       |
+----+----------------------------+
| 1  | /fix/index.md              |
| 2  | /fix/connectivity.md       |
| 3  | /fix/drop-copy.md          |
| 4  | /fix/error-handling.md     |
| 5  | /fix/market-settlement.md  |
| 6  | /fix/order-entry.md        |
| 7  | /fix/order-groups.md       |
| 8  | /fix/rfq-messages.md       |
| 9  | /fix/session-management.md |
| 10 | /fix/subpenny-pricing.md   |
+----+----------------------------+

### /fix/index.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FIX API Overview

> Financial Information eXchange (FIX) protocol implementation for Kalshi

# Kalshi FIX API Specifications

<Note>
  **Version**: 1.0.16
  **Last Updated**: 2025-11-30
</Note>

## Introduction

FIX (Financial Information eXchange) is a standard protocol that can be used to enter orders, submit cancel requests, and receive fills. Kalshi's implementation follows the standards as closely as possible, with any divergences highlighted in this documentation.

Please contact [institutional@kalshi.com](mailto:institutional@kalshi.com) to inquire about FIX access.

## FIX Dictionary Download

Need a machine-readable view of the Kalshi-specific FIX tags and messages? Download the XML dictionary and import it into your FIX tooling of choice:

* [Kalshi FIX Dictionary v0.1 (XML)](https://kalshi-public-docs.s3.us-east-1.amazonaws.com/fix/kalshi-fix-dictionary.xml)

## Key Features

<CardGroup cols={2}>
  <Card title="Session Management" icon="handshake" href="/fix/session-management">
    Logon, logout, heartbeat, and session control messages
  </Card>

  <Card title="Order Entry" icon="cart-shopping" href="/fix/order-entry">
    Submit, modify, and cancel orders through standard FIX messages
  </Card>

  <Card title="Market Settlement" icon="chart-line" href="/fix/market-settlement">
    Market settlement and payout updates
  </Card>

  <Card title="RFQ Support" icon="comments-dollar" href="/fix/rfq-messages">
    Request for Quote functionality for market makers
  </Card>

  <Card title="Drop Copy" icon="copy" href="/fix/drop-copy">
    Separate session for order event recovery
  </Card>

  <Card title="Order Groups" icon="layer-group" href="/fix/order-groups">
    Automatic order cancellation with contracts limits
  </Card>
</CardGroup>

## Getting Started

<Steps>
  <Step title="Generate RSA Keys">
    Create a 2048 bit RSA PKCS#8 key pair for authentication
  </Step>

  <Step title="Create API Key">
    Upload your public key to the Kalshi platform to receive your FIX API key
  </Step>

  <Step title="Configure Connection">
    Set up your FIX client with the appropriate endpoints and credentials
  </Step>

  <Step title="Start Trading">
    Send a Logon message and begin submitting orders
  </Step>
</Steps>

## Support

For technical support or questions about the FIX API, please contact the Kalshi trading support team.

### /fix/connectivity.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Connectivity

> Connection setup and endpoints for Kalshi FIX API

# FIX API Connectivity

## Endpoints

Before logging onto a FIX session, clients must establish a secure connection to the FIX gateway.

<Tabs>
  <Tab title="Production">
    **Host:** `fix.elections.kalshi.com`

    | Purpose                              | Port | TargetCompID |
    | ------------------------------------ | ---- | ------------ |
    | Order Entry (without retransmission) | 8228 | KalshiNR     |
    | Order Entry (with retransmission)    | 8230 | KalshiRT     |
    | Drop Copy                            | 8229 | KalshiDC     |
    | Post Trade                           | 8231 | KalshiPT     |
    | RFQ                                  | 8232 | KalshiRFQ    |
  </Tab>

  <Tab title="Demo">
    **Host:** `fix.demo.kalshi.co`

    | Purpose                              | Port | TargetCompID |
    | ------------------------------------ | ---- | ------------ |
    | Order Entry (without retransmission) | 8228 | KalshiNR     |
    | Order Entry (with retransmission)    | 8230 | KalshiRT     |
    | Drop Copy                            | 8229 | KalshiDC     |
    | Post Trade                           | 8231 | KalshiPT     |
    | RFQ                                  | 8232 | KalshiRFQ    |
  </Tab>
</Tabs>

<Warning>
  Sessions are potentially dropped during trading closed hours for maintenance. For now, this is on Thursdays from 3 AM to 5 AM ET. All users are required to restart their sessions during this time and reset sequence numbers to 0.
</Warning>

## Rate Limits

### Order Entry Session

* **Limit**: Your account-level rate limits are applicable
* **Scope**: Application messages only (from client to server)
* **Excluded**: Session layer messages

<Info>
  Session layer messages excluded from rate limits:

  * Logon (35=A)
  * Logout (35=5)
  * Heartbeat (35=0)
  * TestRequest (35=1)
</Info>

## TCP SSL Configuration

### SSL/TLS Requirements

**You must use TLS/SSL (not plain TCP) to connect to the FIX gateway.** Plain TCP connections will fail because the gateway requires a TLS handshake.

If your FIX implementation does not support native TLS connections, set up a local proxy such as stunnel to establish a secure connection.

<Note>
  Kalshi will provide the certificate for pinning on the initiator side when providing your API key.
</Note>

## Message Retransmission

### Supported Endpoints

Message retransmission is currently only supported on:

* Order Entry with retransmission (KalshiRT)
* RFQ session (KalshiRFQ)

### Unsupported Message Types

For endpoints without retransmission support:

* ResendRequest (35=2) - Not supported
* SequenceReset (35=4) - Not supported

<Warning>
  For sessions without retransmission support, `ResetSeqNumFlag&lt;141&gt;` in the Logon message must always be `true` or the Logon will be rejected.
</Warning>

### Alternative Recovery

The drop copy session endpoint provides an alternative way for clients to query for missed execution reports without using the retransmission protocol.

## Session Configuration

### Required Settings

* **Session Profile**: FIXT.1.1 (required for Application Version Independence)
* **Application Version**: FIX50SP2 (FIX 5.0 SP2)
* **SenderCompID**: Your FIX API Key (UUID format)
* **TargetCompID**: See endpoints table above

### Session Identification

* Session identification uses: `SessionID = TargetCompID + SenderCompID`
* Only one FIX connection is allowed per FIX API Key

<Note>
  Each API key can only be used for a single connection at a time. If you need to establish multiple concurrent connections (e.g., for both order entry and drop copy), you must create separate API keys for each connection.
</Note>

## Best Practices

1. **Connection Management**
   * Implement automatic reconnection logic for the daily maintenance window
   * Monitor heartbeat intervals (default 30 seconds)
   * Handle connection drops gracefully

2. **Sequence Number Management**
   * Reset sequence numbers to 0 after daily maintenance
   * For non-retransmission endpoints, always use `ResetSeqNumFlag=Y`

3. **Security**
   * Store private keys securely
   * Never share private keys, even with Kalshi employees
   * Use certificate pinning when provided

## Troubleshooting

### Common Connection Issues

<AccordionGroup>
  <Accordion title="SSL/TLS Connection Failed">
    * **Verify you are using TLS, not plain TCP** - this is the most common issue
    * Check your FIX library settings to ensure TLS/SSL mode is enabled
    * Verify certificate configuration
    * Check if stunnel or similar proxy is needed if your library doesn't support native TLS
  </Accordion>

  <Accordion title="Logon Rejected">
    * Verify SenderCompID matches your FIX API key
    * Check TargetCompID matches the port number
    * Ensure ResetSeqNumFlag is set correctly for non-retransmission endpoints
    * Verify signature generation uses the exact SendingTime from field 52
  </Accordion>
</AccordionGroup>

### /fix/drop-copy.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Drop Copy Session

> Recover missed execution reports and query historical order events

# Drop Copy Session

## Overview

The drop copy session provides an alternative method to query for missed execution reports without using the FIX retransmission protocol. This is particularly useful for:

* Recovering from connection failures
* Auditing order activity
* Building backup systems
* Compliance recording

<Info>
  Kalshi's DropCopy format utilizes a request-response message type, if you are interested in a session that "follows along" the execution report activity of your trading
  session, consider using a KalshiRT session with the ListenerFlag parameter.
</Info>

## Connection Details

| Environment | URL                      | Port | TargetCompID |
| ----------- | ------------------------ | ---- | ------------ |
| Production  | fix.elections.kalshi.com | 8229 | KalshiDC     |
| Demo        | fix.demo.kalshi.co       | 8229 | KalshiDC     |

## EventResendRequest (35=U1)

Request execution reports within a specified ExecID range.

### Fields

| Tag   | Name        | Description                 | Required |
| ----- | ----------- | --------------------------- | -------- |
| 21001 | BeginExecID | Starting ExecID (inclusive) | Yes      |
| 21002 | EndExecID   | Ending ExecID (inclusive)   | No       |

<Note>
  If EndExecID is not provided, it defaults to the latest ExecID in your history.
</Note>

### Limitations

* **Lookback Window**: Last 3 hours only
* **Message Types**: Only ExecutionReport (35=8) supported
* **Excluded Messages**:
  * Rejects (no valid ExecID)
  * Pending new orders (ExecID = "-1;-1")

### Example Request

```fix  theme={null}
8=FIXT.1.1|35=U1|21001=12345;67890|21002=12350;67895|
```

## EventResendComplete (35=U2)

Sent after all requested events have been resent.

### Fields

| Tag   | Name             | Description                         | Required |
| ----- | ---------------- | ----------------------------------- | -------- |
| 45    | RefSeqNum        | MsgSeqNum of the EventResendRequest | Yes      |
| 21003 | ResentEventCount | Total number of events resent       | Yes      |

## EventResendReject (35=U3)

Sent when a resend request cannot be fulfilled.

### Fields

| Tag   | Name                    | Description                         | Required |
| ----- | ----------------------- | ----------------------------------- | -------- |
| 45    | RefSeqNum               | MsgSeqNum of the EventResendRequest | Yes      |
| 21004 | EventResendRejectReason | Rejection code                      | Yes      |

### Rejection Reasons (21004)

| Code | Description                               |
| ---- | ----------------------------------------- |
| 1    | Too many resend requests                  |
| 2    | Server error                              |
| 3    | BeginExecID is too small (outside window) |
| 4    | EndExecID is too large                    |

## Usage Patterns

### Recovery After Disconnect

<Steps>
  <Step title="Track Last ExecID">
    Store the last processed ExecID before disconnect
  </Step>

  <Step title="Reconnect to Drop Copy">
    Establish new drop copy session
  </Step>

  <Step title="Request Missing Events">
    Send EventResendRequest starting from last ExecID
  </Step>

  <Step title="Process Resent Events">
    Handle execution reports with new sequence numbers
  </Step>
</Steps>

## Best Practices

### 1. ExecID Management

* Store ExecIDs persistently
* Handle the two-part format correctly (e.g., "12345;67890")
* Implement proper ID comparison logic

### 2. Rate Limiting

* Avoid excessive resend requests
* Implement exponential backoff on failures
* Batch requests when possible

### 3. Deduplication

* Events may arrive via both primary and drop copy sessions
* Implement deduplication based on ExecID
* Handle out-of-order delivery

### 4. Error Recovery

* Handle all rejection codes appropriately
* Implement retry logic with delays
* Alert on persistent failures

## Comparison with Retransmission

| Feature          | Drop Copy            | Retransmission      |
| ---------------- | -------------------- | ------------------- |
| Session Type     | Separate             | Same as order entry |
| Sequence Numbers | Independent          | Original preserved  |
| Lookback Window  | 3 hours              | 3 hours             |
| Message Types    | ExecutionReport only | All types           |
| Use Case         | Recovery/Audit       | Real-time gaps      |

<Warning>
  All resent messages will have new FIX sequence numbers in the drop copy session, different from their original sequence numbers in the order entry session.
</Warning>

### /fix/error-handling.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Error Handling

> Understanding and handling errors in the FIX protocol

# Error Handling

## Overview

Kalshi FIX API uses standard FIX error messages with additional detail in the Text field. Errors fall into two categories:

* **Session-level errors**: Protocol violations, handled with Reject (35=3)
* **Business-level errors**: Application logic issues, handled with BusinessMessageReject (35=j) or specific rejection messages

## Error Message Types

### Reject (35=3)

Used for session-level protocol violations.

| Tag | Name                | Description                         | Required |
| --- | ------------------- | ----------------------------------- | -------- |
| 45  | RefSeqNum           | Sequence number of rejected message | Yes      |
| 58  | Text                | Human-readable error description    | No       |
| 371 | RefTagID            | Tag that caused the rejection       | No       |
| 372 | RefMsgType          | Message type being rejected         | No       |
| 373 | SessionRejectReason | Rejection reason code               | No       |

#### Session Reject Reasons (373)

| Code | Reason                      | Description                         |
| ---- | --------------------------- | ----------------------------------- |
| 0    | Invalid tag number          | Unknown tag in message              |
| 1    | Required tag missing        | Mandatory field not present         |
| 2    | Tag not defined for message | Tag not valid for this message type |
| 3    | Undefined tag               | Tag number not in FIX specification |
| 4    | Tag without value           | Empty tag value                     |
| 5    | Incorrect value             | Invalid value for tag               |
| 6    | Incorrect data format       | Wrong data type                     |
| 7    | Decryption problem          | Security issue                      |
| 8    | Signature problem           | Authentication failure              |
| 9    | CompID problem              | SenderCompID/TargetCompID issue     |
| 10   | SendingTime accuracy        | Time outside acceptable window      |
| 11   | Invalid MsgType             | Unknown message type                |

### BusinessMessageReject (35=j)

Used for application-level business logic errors.

| Tag | Name                 | Description                         | Required |
| --- | -------------------- | ----------------------------------- | -------- |
| 45  | RefSeqNum            | Sequence number of rejected message | Yes      |
| 58  | Text                 | Human-readable error description    | No       |
| 371 | RefTagID             | Tag that caused the rejection       | No       |
| 372 | RefMsgType           | Message type being rejected         | No       |
| 379 | BusinessRejectRefID  | Business ID from rejected message   | No       |
| 380 | BusinessRejectReason | Business rejection reason code      | Yes      |

#### Business Reject Reasons (380)

| Code | Reason                               | Description                    |
| ---- | ------------------------------------ | ------------------------------ |
| 0    | Other                                | See Text field for details     |
| 1    | Unknown ID                           | Referenced ID not found        |
| 2    | Unknown Security                     | Invalid symbol                 |
| 3    | Unsupported Message Type             | Message type not implemented   |
| 4    | Application not available            | System temporarily unavailable |
| 5    | Conditionally required field missing | Context-specific field missing |

## Order-Specific Rejections

### Order Reject Reasons (103)

In ExecutionReport (35=8) with ExecType=Rejected:

| Code | Reason                           | Common Causes                                                    |
| ---- | -------------------------------- | ---------------------------------------------------------------- |
| 1    | Unknown symbol                   | Invalid market ticker                                            |
| 2    | Exchange closed                  | Outside trading hours                                            |
| 3    | Order exceeds limit              | Position or order size limit, insufficient balance               |
| 4    | Too late to enter                | Market expired/closed                                            |
| 6    | Duplicate order                  | ClOrdID already used                                             |
| 11   | Unsupported order characteristic | Invalid order parameters, order ID/side/ticker mismatch on amend |
| 13   | Incorrect quantity               | Invalid order size                                               |
| 99   | Other                            | See Text field                                                   |

### Cancel Reject Reasons (102)

In OrderCancelReject (35=9):

| Code | Reason             | Description                                       |
| ---- | ------------------ | ------------------------------------------------- |
| 0    | Too late to cancel | Order already filled                              |
| 1    | Unknown order      | Order ID not found, order ID/side/ticker mismatch |
| 99   | Other              | See Text field                                    |

## Common Error Scenarios

### Example 1: Invalid Tag

**Scenario**: Undefined tag in NewOrderSingle

```fix  theme={null}
// Sent
8=FIXT.1.1|35=D|11=123|38=10|333333=test|...

// Response: Reject
8=FIXT.1.1|35=3|45=5|58=Undefined tag received|371=333333|372=D|373=3|
```

### Example 2: Business Logic Error

**Scenario**: Trading during maintenance

```fix  theme={null}
// Sent
8=FIXT.1.1|35=D|11=456|38=10|55=HIGHNY-23DEC31|...

// Response: BusinessMessageReject
8=FIXT.1.1|35=j|45=10|58=Kalshi exchange unavailable|372=D|380=4|
```

### Example 3: Order Rejection

**Scenario**: Insufficient funds

```fix  theme={null}
// Response: ExecutionReport
8=FIXT.1.1|35=8|11=789|150=8|39=8|58=Insufficient funds|103=99|...
```

## Error Handling Best Practices

### 1. Comprehensive Logging

```python  theme={null}
def handle_message(msg):
    if msg.type == 'Reject':
        log.error(f"Session reject: {msg.Text} (Tag: {msg.RefTagID}, Reason: {msg.SessionRejectReason})")
    elif msg.type == 'BusinessMessageReject':
        log.error(f"Business reject: {msg.Text} (Reason: {msg.BusinessRejectReason})")
    elif msg.type == 'ExecutionReport' and msg.ExecType == 'Rejected':
        log.error(f"Order rejected: {msg.Text} (Reason: {msg.OrdRejReason})")
```

### 2. Retry Strategies

| Error Type         | Retry Strategy                  |
| ------------------ | ------------------------------- |
| Session errors     | Fix protocol issue before retry |
| Rate limit         | Exponential backoff             |
| Exchange closed    | Wait for market open            |
| Insufficient funds | Check balance before retry      |
| Unknown symbol     | Verify symbol, don't retry      |

### 3. Graceful Degradation

<Steps>
  <Step title="Identify Error Type">
    Distinguish between recoverable and non-recoverable errors
  </Step>

  <Step title="Apply Appropriate Action">
    * Recoverable: Implement retry with backoff
    * Non-recoverable: Alert and halt
  </Step>

  <Step title="Monitor and Alert">
    Track error rates and patterns for system health
  </Step>
</Steps>

## Specific Error Conditions

### Authentication Errors

| Symptom        | Likely Cause      | Resolution                            |
| -------------- | ----------------- | ------------------------------------- |
| Logon rejected | Invalid signature | Check RSA key and signature algorithm |
| CompID problem | Wrong API key     | Verify SenderCompID matches API key   |
| Time accuracy  | Clock skew        | Sync system time with NTP             |

### Order Entry Errors

| Error               | Check           | Action                                         |
| ------------------- | --------------- | ---------------------------------------------- |
| Unknown symbol      | Symbol format   | Use exact ticker from market data              |
| Order exceeds limit | Position limits | Query current position                         |
| Duplicate ClOrdID   | ID generation   | Ensure UUID uniqueness                         |
| Invalid price       | Price range     | Ensure (0, 100) cents with valid tick interval |

### Connection Errors

<Warning>
  Connection errors often manifest as:

  * Heartbeat timeout
  * Sequence number gaps
  * Socket disconnection

  Always implement reconnection logic with appropriate delays.
</Warning>

## Error Response Patterns

### Synchronous Errors

Immediate response to invalid request:

```
Request → Validation → Immediate Error Response
```

### Asynchronous Errors

Delayed errors during processing:

```
Request → Initial Accept → Processing → Later Error Report
```

### /fix/market-settlement.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Market Settlement

> Settlement reports for market outcomes and position resolution

# Market Settlement

## Overview

Market settlement messages provide information about market outcomes and the resulting position settlements. These messages are available on:

* **KalshiPT** (Post Trade) sessions
* **KalshiRT** sessions when `ReceiveSettlementReports=Y` in Logon

<Info>
  Settlement occurs when a market's outcome is determined, triggering automatic position resolution and fund transfers.
</Info>

## Market Settlement Report (35=UMS)

Provides settlement details for a specific market.

### Message Structure

| Tag   | Name                          | Description                                                          | Required |
| ----- | ----------------------------- | -------------------------------------------------------------------- | -------- |
| 20105 | MarketSettlementReportID      | Unique settlement identifier                                         | Yes      |
| 55    | Symbol                        | Market ticker (e.g., NHIGH-23JAN02-66)                               | Yes      |
| 715   | ClearingBusinessDate          | Date settlement cleared (YYYYMMDD)                                   | Yes      |
| 20106 | TotNumMarketSettlementReports | Total number of settlement reports in sequence                       | No       |
| 20107 | MarketResult                  | Result of the market when determined                                 | Yes      |
| 893   | LastFragment                  | Last page indicator (Y/N)                                            | No       |
| 730   | SettlementPrice               | Settlement price of market in cents (2 decimal places, e.g. `30.60`) | Yes      |

### Repeating Groups

#### Party Information (NoMarketSettlementPartyIDs)

| Tag   | Name                       | Description                           |
| ----- | -------------------------- | ------------------------------------- |
| 20108 | NoMarketSettlementPartyIDs | Number of parties                     |
| 20109 | MarketSettlementPartyID    | Unique identifier for party           |
| 20110 | MarketSettlementPartyRole  | Type of party (Customer Account\<24>) |
| 704   | LongQty                    | Number of YES contracts held          |
| 705   | ShortQty                   | Number of NO contracts held           |

#### Collateral Changes (NoCollateralAmountChanges)

| Tag  | Name                      | Description                                                             |
| ---- | ------------------------- | ----------------------------------------------------------------------- |
| 1703 | NoCollateralAmountChanges | Number of collateral changes (should be only 1 - payout balance change) |
| 1704 | CollateralAmountChange    | Delta in dollars                                                        |
| 1705 | CollateralAmountType      | Balance\<1> or Payout\<2>                                               |

#### Fees (NoMiscFees)

| Tag | Name         | Description                                                     |
| --- | ------------ | --------------------------------------------------------------- |
| 136 | NoMiscFees   | Number of fees (currently zero, single item with zeroed values) |
| 137 | MiscFeeAmt   | Total fees for settlement in dollars                            |
| 138 | MiscFeeCurr  | Currency (USD)                                                  |
| 139 | MiscFeeType  | Type of fee (Exchange fees\<4>)                                 |
| 891 | MiscFeeBasis | Unit for fee (Absolute\<0>)                                     |

## Settlement Process

### Market Resolution Flow

```mermaid  theme={null}
graph TD
    A[Market Expires] --> B[Outcome Determined]
    B --> C[Settlement Report Generated]
    C --> D[Positions Resolved]
    D --> E[Funds Transferred]

    D --> F[Yes Holders: Receive $1]
    D --> G[No Holders: Receive $0]
```

### Settlement Calculations

For each position:

* **Yes outcome**: Yes contract holders receive \$1 per contract
* **No outcome**: No contract holders receive \$1 per contract
* **Net position**: Only net positions are settled (after netting)

## Example Settlement Report

```fix  theme={null}
// Market settled as "Yes"
8=FIXT.1.1|35=UMS|
20105=settle-123|55=HIGHNY-23DEC31|715=20231231|
20107=Yes|
20108=1|
  20109=user-456|20110=24|
  704=100|705=0|
  1703=1|
    1704=10000|1705=1|
  136=1|
    137=0.00|138=USD|139=4|891=0|
893=Y|
```

This example shows:

* Market HIGHNY-23DEC31 settled as "Yes"
* User held 100 Yes contracts
* Received \$100.00 (10000 cents) to balance
* No settlement fees

## Pagination

Large settlement batches may span multiple messages:

| Tag   | Use Case                                  |
| ----- | ----------------------------------------- |
| 20106 | Total number of reports in batch          |
| 893   | LastFragment=N for more pages, Y for last |

<Warning>
  **Important:** The `MarketSettlementReportID` (tag 20105) will be different across paginated responses.
  Each page of results generates a new unique settlement ID. Use the `Symbol` (tag 55) ticker to identify fragments belonging to the same paginated settlement.
</Warning>

## Settlement Timing

<Warning>
  Markets typically settle shortly after expiration, but timing can vary based on:

  * Market type
  * Data source availability
  * Manual review requirements
</Warning>

## Integration Considerations

### 1. Position Reconciliation

```python  theme={null}
def reconcile_settlement(report):
    # Verify position matches records
    our_position = get_position(report.Symbol)

    if report.LongQty != our_position.yes_contracts:
        alert("Position mismatch", report)

    # Verify payout calculation
    if report.MarketResult == "Yes":
        expected_payout = report.LongQty * 100  # cents
    else:
        expected_payout = report.ShortQty * 100

    if report.CollateralAmountChange != expected_payout:
        alert("Payout mismatch", report)
```

### 2. Multi-Account Handling

For sessions managing multiple accounts:

* Each party (sub-account) receives separate entry
* Aggregate by MarketSettlementPartyID
* Track settlements per account

### 3. Fee Processing

Currently settlement fees are zero, but implement handling for future changes:

* Parse NoMiscFees group
* Account for fees in P\&L calculations
* Track fee types for reporting

## Best Practices

### Real-time Processing

<Steps>
  <Step title="Subscribe to Reports">
    Set ReceiveSettlementReports=Y in KalshiRT Logon
  </Step>

  <Step title="Process Immediately">
    Update positions and balances in real-time
  </Step>

  <Step title="Reconcile">
    Compare with expected outcomes and positions
  </Step>

  <Step title="Update Risk">
    Adjust risk calculations for settled positions
  </Step>
</Steps>

### Batch Processing

For post-trade reconciliation:

1. Connect to KalshiPT session
2. Query for day's settlements
3. Process in sequence order
4. Generate settlement reports

## Related Systems

| System      | Purpose                               |
| ----------- | ------------------------------------- |
| Order Entry | Track positions leading to settlement |
| Drop Copy   | Audit trail of trades                 |
| Market Data | Market expiration times               |
| REST API    | Query market details and outcomes     |

## Error Scenarios

### Missing Settlements

If settlements are missing:

1. Check connection to appropriate session
2. Verify ReceiveSettlementReports flag
3. Use REST API as backup data source
4. Contact support if discrepancies persist

### Incorrect Positions

Position mismatches may indicate:

* Missed execution reports
* Incorrect position tracking
* Late trades near expiration

Always maintain independent position tracking for verification.

### /fix/order-entry.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Order Entry Messages

> Submit, modify, and cancel orders through FIX messages

# Order Entry Messages

## Overview

Kalshi treats all orders as bids or asks for Yes contracts. Selling Yes is equivalent to buying No contracts.

## New Order Single (35=D)

Used to submit a new order to the Exchange.

| Tag   | Name                    | Type         | Required | Description                                                                                                                                                                                                                                                                                                                                                                                |
| ----- | ----------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 11    | ClOrderID               | String       | Y        | Client order identifier for idempotency. Must not match any open orders.<br /><br />**UUID format is preferred.**<br /><br />Validation:<br />• Maximum 64 characters<br />• Only alphanumeric, "+", "=", "\_", "-", and ":" characters allowed<br />• Pattern: `^[\-\w:+=/]*$`                                                                                                            |
| 18    | ExecInst                | Char         | N        | Execution instruction flags.<br /><br />Supported values:<br />6 = Post Only                                                                                                                                                                                                                                                                                                               |
| 38    | OrderQty                | Integer      | Y        | Number of contracts to trade.                                                                                                                                                                                                                                                                                                                                                              |
| 40    | OrdType                 | Char         | Y        | Order type.<br /><br />Supported values:<br />2 = Limit                                                                                                                                                                                                                                                                                                                                    |
| 44    | Price                   | Integer      | Y        | Price per contract in cents (1-99).                                                                                                                                                                                                                                                                                                                                                        |
| 54    | Side                    | Char         | Y        | Side of the order.<br /><br />Supported values:<br />1 = Buy (Yes contracts)<br />2 = Sell (No contracts)                                                                                                                                                                                                                                                                                  |
| 55    | Symbol                  | String       | Y        | Market ticker (e.g., "EURUSD-23JUN2618-B1.087").                                                                                                                                                                                                                                                                                                                                           |
| 59    | TimeInForce             | Char         | N        | Specifies how long the order remains in effect.<br /><br />Supported values:<br />0 = Day (expires at 11:59:59.999pm ET)<br />1 = Good Till Cancel (GTC)<br />3 = Immediate Or Cancel (IOC)<br />4 = Fill Or Kill (FOK)<br />6 = Good Till Date (GTD)<br /><br />**Note:** Day orders expire at 11:59:59.999pm ET. For GTD orders, any date in the past is treated as Immediate Or Cancel. |
| 126   | ExpireTime              | UTCTimestamp | C        | Required when TimeInForce=GTD. Specifies when the GTD order expires.                                                                                                                                                                                                                                                                                                                       |
| 448   | PartyID                 | UUID         | N        | **Only applicable for FCM entities .** Sub-account identifier.                                                                                                                                                                                                                                                                                                                             |
| 452   | PartyRole               | Integer      | N        | **Only applicable for FCM entities .** Party role.<br /><br />Supported values:<br />24 = Customer Account                                                                                                                                                                                                                                                                                 |
| 453   | NoPartyIDs              | Integer      | N        | **Only applicable for FCM entities .** Number of parties. Currently, only 1 is supported.                                                                                                                                                                                                                                                                                                  |
| 79    | AllocAccount            | Integer      | N        | Subaccount number (0-32). Alternative to NoPartyIDs for specifying a subaccount.                                                                                                                                                                                                                                                                                                           |
| 526   | SecondaryClOrdID        | UUID         | N        | Order group identifier. Please refer to the Order Groups tab for more information.                                                                                                                                                                                                                                                                                                         |
| 2964  | SelfTradePreventionType | Char         | N        | Self-trade prevention mode. If unset, defaults to Taker At Cross. <br /><br />Supported values:<br />1 = Taker At Cross<br />2 = Maker                                                                                                                                                                                                                                                     |
| 21006 | CancelOrderOnPause      | Boolean      | N        | If this flag is set to true, the order will be canceled if the order is open and trading on the exchange is paused for any reason.                                                                                                                                                                                                                                                         |
| 21009 | MaxExecutionCost        | Decimal      | N        | Optional value representing max execution cost for an order in dollars. Order is canceled if unable to fill OrdQty for the given cost.                                                                                                                                                                                                                                                     |

<CodeGroup>
  ```fix Example New Order theme={null}
  8=FIXT.1.1|9=200|35=D|34=5|52=20230809-12:34:56.789|49=your-api-key|56=KalshiNR|
  11=550e8400-e29b-41d4-a716-446655440000|38=10|40=2|54=1|55=HIGHNY-23DEC31|44=75|
  59=1|10=123|
  ```
</CodeGroup>

## Order Cancel/Replace Request (35=G)

Used to modify an existing order without canceling it.

### Supported Modifications

* **OrderQty**: Increases or decreases the quantity of your order, note that increasing the quantity for the same point means forfeiting your queue position
* **Price**: Changes the limit price of your order

| Tag | Name         | Type    | Required | Description                                                                                                                                                                                                                                                                           |
| --- | ------------ | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  | ClOrderID    | String  | Y        | Unique modification request identifier. Must not match any existing ClOrderID.<br /><br />**UUID format is preferred.**<br /><br />Validation:<br />• Maximum 64 characters<br />• Only alphanumeric, "+", "=", "\_", "-", and ":" characters allowed<br />• Pattern: `^[\-\w:+=/]*$` |
| 37  | OrderID      | String  | N        | Order identifier provided by Kalshi Exchange.                                                                                                                                                                                                                                         |
| 38  | OrderQty     | Integer | Y        | New total quantity for the order.<br /><br />**Note:** If OrderQty equals filled quantity, the order will be canceled. If less than filled quantity, the request will be rejected.                                                                                                    |
| 40  | OrdType      | Char    | Y        | Order type.<br /><br />Supported values:<br />2 = Limit                                                                                                                                                                                                                               |
| 41  | OrigClOrdID  | String  | Y        | ClOrderID of the order to modify.                                                                                                                                                                                                                                                     |
| 44  | Price        | Integer | N        | New price per contract in cents (1-99). Required if changing price.                                                                                                                                                                                                                   |
| 54  | Side         | Char    | Y        | Must match the original order side.                                                                                                                                                                                                                                                   |
| 55  | Symbol       | String  | Y        | Must match the original order symbol.                                                                                                                                                                                                                                                 |
| 448 | PartyID      | UUID    | N        | **Only applicable for FCM entities .** Sub-account identifier. Must match the original order field value.                                                                                                                                                                             |
| 452 | PartyRole    | Integer | N        | **Only applicable for FCM entities .** Party role. Must match the original order field value.<br /><br />Supported values:<br />24 = Customer Account                                                                                                                                 |
| 453 | NoPartyIDs   | Integer | N        | **Only applicable for FCM entities .** Number of parties. Must match the original order field value. Currently, only 1 is supported.                                                                                                                                                  |
| 79  | AllocAccount | Integer | N        | Subaccount number (0-32). Must match the original order. Alternative to NoPartyIDs for specifying a subaccount.                                                                                                                                                                       |

## Order Cancel Request (35=F)

Cancel all remaining quantity of an existing order.

| Tag | Name         | Type    | Required | Description                                                                                                                                                                                                                                                                     |
| --- | ------------ | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  | ClOrderID    | String  | Y        | Unique cancel request identifier. Must not match any existing ClOrderID.<br /><br />**UUID format is preferred.**<br /><br />Validation:<br />• Maximum 64 characters<br />• Only alphanumeric, "+", "=", "\_", "-", and ":" characters allowed<br />• Pattern: `^[\-\w:+=/]*$` |
| 37  | OrderID      | String  | N        | Order identifier provided by Kalshi Exchange.                                                                                                                                                                                                                                   |
| 41  | OrigClOrdID  | String  | Y        | ClOrderID of the order to cancel.                                                                                                                                                                                                                                               |
| 54  | Side         | Char    | Y        | Must match the original order side.                                                                                                                                                                                                                                             |
| 55  | Symbol       | String  | Y        | Must match the original order symbol.                                                                                                                                                                                                                                           |
| 448 | PartyID      | UUID    | N        | **Only applicable for FCM entities .** Sub-account identifier. Must match the original order field value.                                                                                                                                                                       |
| 452 | PartyRole    | Integer | N        | **Only applicable for FCM entities .** Party role. Must match the original order field value.<br /><br />Supported values:<br />24 = Customer Account                                                                                                                           |
| 453 | NoPartyIDs   | Integer | N        | **Only applicable for FCM entities .** Number of parties. Must match the original order field value. Currently, only 1 is supported.                                                                                                                                            |
| 79  | AllocAccount | Integer | N        | Subaccount number (0-32). Must match the original order. Alternative to NoPartyIDs for specifying a subaccount.                                                                                                                                                                 |

## Execution Report (35=8)

This message is sent by Kalshi Exchange back to clients to reflect changes to an order's state (accepted, replaced, partially filled, filled or canceled).

| Tag | Name         | Type         | Required | Description                                                                                                                                                                                                                                 |
| --- | ------------ | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | AvgPx        | Decimal      | Y        | Calculated average price of all fills on this order.                                                                                                                                                                                        |
| 11  | ClOrderID    | String       | Y        | ClOrderID provided by the initiator on the last message that made any change to the order.                                                                                                                                                  |
| 14  | CumQty       | Integer      | Y        | Total number of contracts filled in this order so far.                                                                                                                                                                                      |
| 17  | ExecID       | String       | Y        | Unique sequenced identifier for this report message.<br /><br />**Format:** `integer;integer` pattern (e.g., "4;4", "4;7", "7;3")<br /><br />Monotonically increasing at the Exchange level. Returns "-1;-1" for PENDING execution reports. |
| 31  | LastPx       | Integer      | C        | Price of this (last) fill in cents. Present only for trade execution reports.                                                                                                                                                               |
| 32  | LastQty      | Integer      | C        | Number of contracts bought or sold in this fill. Present only for trade execution reports.                                                                                                                                                  |
| 37  | OrderID      | String       | Y        | Unique identifier for the order in the Kalshi Exchange. Use this ID when referencing the order for support.                                                                                                                                 |
| 38  | OrderQty     | Integer      | Y        | Total number of contracts currently in the order. OrderQty = CumQty + LeavesQty.                                                                                                                                                            |
| 39  | OrdStatus    | Char         | Y        | Current status of the order after this event. See Order Status values below.                                                                                                                                                                |
| 41  | OrigClOrdID  | String       | C        | ClOrderID of the previous non-rejected order state. Present for Replaced/Canceled orders.                                                                                                                                                   |
| 44  | Price        | Integer      | C        | Price per contract in cents.                                                                                                                                                                                                                |
| 54  | Side         | Char         | Y        | Side of the original order.<br /><br />Values:<br />1 = Buy (Yes contracts)<br />2 = Sell (No contracts)                                                                                                                                    |
| 55  | Symbol       | String       | Y        | Market ticker for the order.                                                                                                                                                                                                                |
| 58  | Text         | String       | N        | Human-readable description of the execution report result.                                                                                                                                                                                  |
| 60  | TransactTime | UTCTimestamp | Y        | Timestamp for the event that triggered this execution report.                                                                                                                                                                               |
| 103 | OrdRejReason | Integer      | C        | Rejection reason. Present only when ExecType = Rejected. See Order Rejection Reasons below.                                                                                                                                                 |
| 126 | ExpireTime   | UTCTimestamp | C        | Order expiration timestamp. Returns 11:59pm ET for Day orders.                                                                                                                                                                              |
| 150 | ExecType     | Char         | Y        | Reason why this execution report was sent. See Execution Types below.                                                                                                                                                                       |
| 151 | LeavesQty    | Integer      | Y        | Remaining quantity open for further execution on this order.                                                                                                                                                                                |
| 448 | PartyID      | UUID         | N        | **Only applicable for FCM entities .** Sub-account identifier.                                                                                                                                                                              |
| 452 | PartyRole    | Integer      | N        | **Only applicable for FCM entities .** Party role.<br /><br />Supported values:<br />24 = Customer Account                                                                                                                                  |
| 453 | NoPartyIDs   | Integer      | N        | **Only applicable for FCM entities .** Number of parties. Currently, only 1 is supported.                                                                                                                                                   |
| 79  | AllocAccount | Integer      | C        | Subaccount number (0-32). Present if the order was placed for a subaccount.                                                                                                                                                                 |

### Order Status (39)

* **New\<0>**: Active order, no fills
* **Partially Filled\<1>**: Some quantity filled
* **Filled\<2>**: Completely filled
* **Canceled\<4>**: Canceled (may have partial fills)
* **Pending Cancel\<6>**: Cancel pending
* **Rejected\<8>**: Order rejected
* **Pending New\<A>**: Order pending acceptance
* **Expired\<C>**: Time in force expired
* **Pending Replace\<E>**: Modification pending

<Note>
  By default, expiry-style system cancellations are reported as **Canceled\<4>**.\
  If Logon tag **21012 (UseExpiredOrdStatus)=Y**, expiry-style system cancellations (CloseCancel and OrderExpiryCancel) are reported as **Expired\<C>**.
</Note>

### Order Rejection Reasons (103)

* **Unknown symbol\<1>**
* **Exchange closed\<2>**
* **Order exceeds limit\<3>**
* **Too late to enter\<4>**
* **Duplicate order\<6>**
* **Unsupported order characteristic\<11>**
* **Unknown account\<15>**
* **Other\<99>**

### Execution Types (150)

* **New\<0>**: Order accepted
* **Trade\<F>**: Order filled (partial or complete)
* **Canceled\<4>**: Order canceled
* **Replaced\<5>**: Order modified
* **Rejected\<8>**: Order rejected
* **Expired\<C>**: Order expired
* **Pending New\<A>**: Order pending acceptance
* **Pending Cancel\<6>**: Cancel pending
* **Pending Replace\<E>**: Modification pending

<Note>
  With default settings, expiry-style system cancellations emit **Canceled\<4>**.\
  If Logon tag **21012 (UseExpiredOrdStatus)=Y**, expiry-style system cancellations (CloseCancel and OrderExpiryCancel) emit **Expired\<C>**.
</Note>

### Text Field Values (58)

Common values for the Text field in Execution Reports:

* **EXCHANGE\_UNAVAILABLE** - Catch-all for Exchange outage or unmapped errors, maps to OrdRejReason "Other"
* **MARKET\_ALREADY\_CLOSED** - maps to OrdRejReason "Exchange closed"
* **MARKET\_INACTIVE** - maps to OrdRejReason "Exchange closed"
* **MARKET\_NOT\_FOUND** - maps to OrdRejReason "Unknown symbol"
* **SELF\_CROSS\_ATTEMPT** - maps to ExecutionType "Canceled"
* **SELF\_CROSS\_ATTEMPT\_PARTIALLY\_FILLED** - maps to ExecutionType "Canceled"
* **ORDER\_ALREADY\_EXISTS** - maps to OrdRejReason "Duplicate order"
* **INVALID\_AMEND\_QTY\_FOR\_ORDER** - maps to OrdRejReason "Other"
* **CANNOT\_UPDATE\_FILLED\_ORDER** - maps to OrdRejReason "Too late to enter"
* **EXCEEDED\_ORDER\_GROUP\_RISK\_LIMIT** - maps to OrdRejReason "Order exceeds limit"
* **INSUFFICIENT\_BALANCE** - maps to OrdRejReason "Other"
* **EXCHANGE\_PAUSED** - maps to OrdRejReason "Exchange closed"
* **TRADING\_PAUSED** - maps to OrdRejReason "Exchange closed"
* **INVALID\_ORDER** - maps to OrdRejReason "Unsupported order characteristic"
* **ORDER\_GROUP\_NOT\_FOUND** - maps to OrdRejReason "Unsupported order characteristic"
* **EXCEEDED\_PER\_MARKET\_RISK\_LIMIT** - maps to OrdRejReason "Order exceeds limit"
* **EXCEEDED\_SELL\_POSITION\_FLOOR** - maps to OrdRejReason "Order exceeds limit"
* **NOT\_FOUND** - maps to OrdRejReason "Unknown symbol"
* **CUSTOMER\_ACCOUNT\_NOT\_FOUND** - maps to OrdRejReason "Unknown account"
* **PERMISSION\_DENIED\_FOR\_CUSTOMER\_ACCOUNT** - maps to OrdRejReason "Unknown account"
* **FOK\_INSUFFICIENT\_VOLUME** - maps to ExecutionType "Canceled"
* **POST\_ONLY\_CROSS** - maps to OrdRejReason "Other"
* **ORDER\_GROUP\_CANCEL** - maps to ExecutionType "Canceled"
* **TAKER\_CANCEL\_FOR\_SELF\_TRADE\_PREVENTION** - maps to ExecutionType "Canceled"
* **MAKER\_CANCEL\_FOR\_SELF\_TRADE\_PREVENTION** - maps to ExecutionType "Canceled"
* **IMMEDIATE\_OR\_CANCELLED** - maps to ExecutionType "Canceled"

### Position and Fee Information

When ExecType=Trade:

| Tag  | Name               | Description                    |
| ---- | ------------------ | ------------------------------ |
| 704  | LongQty            | Net Yes position after trade   |
| 705  | ShortQty           | Net No position after trade    |
| 136  | NoMiscFees         | Number of fees                 |
| 137  | MiscFeeAmt         | Total fees in dollars          |
| 138  | MiscFeeCurr        | Currency (USD)                 |
| 139  | MiscFeeType        | Exchange Fees\<4>              |
| 891  | MiscFeeBasis       | Fee unit (always ABSOLUTE\<0>) |
| 880  | TrdMatchID         | Unique trade identifier        |
| 1057 | AggressorIndicator | Taker/Maker flag               |

### Collateral Changes

| Tag  | Name                    | Description                  |
| ---- | ----------------------- | ---------------------------- |
| 1703 | NoCollateralAmounts     | Number of collateral changes |
| 1704 | CurrentCollateralAmount | Delta in dollars             |
| 1705 | CollateralType          | BALANCE or PAYOUT            |

### Party Information

Party fields from the original order request are echoed back in ExecutionReports:

| Tag | Name         | Description                          |
| --- | ------------ | ------------------------------------ |
| 453 | NoPartyIDs   | Number of parties (for sub-accounts) |
| 448 | PartyID      | Sub-account identifier               |
| 452 | PartyRole    | Customer Account\<24>                |
| 79  | AllocAccount | Subaccount number (0-32)             |

<Note>
  Party and AllocAccount fields are only included when the order is placed under a sub-account. These fields help track orders across different sub-accounts or FCM clients.
</Note>

### Rejection Reasons (102)

* **Too late to cancel\<0>**: Order already filled
* **Unknown order\<1>**: Order not found
* **Other\<99>**: See Text field

## Mass Cancel Request (35=q)

Cancel all orders for the trading session.

| Tag | Name                  | Description            |
| --- | --------------------- | ---------------------- |
| 11  | ClOrderID             | Unique request ID      |
| 530 | MassCancelRequestType | Cancel for session\<6> |

## Mass Cancel Report (35=r)

Response to mass cancel request.

| Tag | Name                   | Description                 |
| --- | ---------------------- | --------------------------- |
| 11  | ClOrderID              | Request ID                  |
| 37  | OrderID                | Operation ID                |
| 531 | MassCancelResponse     | Success\<6> or Rejected\<0> |
| 532 | MassCancelRejectReason | If rejected                 |

<Note>
  Individual ExecutionReports will follow for each canceled order.
</Note>

### /fix/order-groups.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Order Group Messages

> Manage order groups for automatic position management

# Order Group Messages

## Overview

Order groups provide automatic order cancellation when a contracts limit is reached. This feature helps manage risk by ensuring positions don't exceed predefined thresholds. Limits are evaluated over a rolling 15-second window. Order groups are managed through custom FIX message types.

<Info>
  When an order group's contracts limit is hit, all orders in the group are automatically canceled and no new orders can be placed until the group is reset.
</Info>

## Order Group Request (35=UOG)

Manage order groups with Create, Reset, Delete, Trigger, and Update operations.

### Required Fields

| Tag   | Name             | Description          | Type/Values                                                |
| ----- | ---------------- | -------------------- | ---------------------------------------------------------- |
| 20131 | OrderGroupAction | Operation to perform | Create\<1>, Reset\<2>, Delete\<3>, Trigger\<4>, Update\<5> |

### Fields by Action

#### Create (Action=1)

| Tag   | Name                     | Description                             | Required |
| ----- | ------------------------ | --------------------------------------- | -------- |
| 20132 | OrderGroupContractsLimit | Maximum contracts allowed (1-1,000,000) | Yes      |

<Note>
  The OrderGroupID is generated by the server and returned in the response. Do not include tag 20130 in Create requests.
</Note>

#### Reset (Action=2)

| Tag   | Name         | Description          | Required |
| ----- | ------------ | -------------------- | -------- |
| 20130 | OrderGroupID | ID of group to reset | Yes      |

#### Delete (Action=3)

| Tag   | Name         | Description           | Required |
| ----- | ------------ | --------------------- | -------- |
| 20130 | OrderGroupID | ID of group to delete | Yes      |

#### Trigger (Action=4)

| Tag   | Name         | Description            | Required |
| ----- | ------------ | ---------------------- | -------- |
| 20130 | OrderGroupID | ID of group to trigger | Yes      |

<Warning>
  The Trigger action immediately cancels all orders in the specified order group, regardless of whether the contracts limit has been reached. This is useful for manual risk management or emergency order cancellation.
</Warning>

#### Update (Action=5)

| Tag   | Name                     | Description                                 | Required |
| ----- | ------------------------ | ------------------------------------------- | -------- |
| 20130 | OrderGroupID             | ID of group to update                       | Yes      |
| 20132 | OrderGroupContractsLimit | New maximum contracts allowed (1-1,000,000) | Yes      |

<Note>
  If the updated limit would immediately trigger the group (based on the rolling 15-second window), the server cancels all
  orders in the group and marks it as triggered. No new orders can be placed until the group is reset.
</Note>

### Example Messages

```fix Create Order Group theme={null}
8=FIXT.1.1|9=150|35=UOG|34=5|52=20230809-12:34:56.789|49=your-api-key|56=KalshiNR|
20131=1|20132=5000|10=123|
```

```fix Reset Order Group theme={null}
8=FIXT.1.1|9=150|35=UOG|34=6|52=20230809-12:34:57.789|49=your-api-key|56=KalshiNR|
20131=2|20130=770e8400-e29b-41d4-a716-446655440002|10=124|
```

```fix Delete Order Group theme={null}
8=FIXT.1.1|9=150|35=UOG|34=7|52=20230809-12:34:58.789|49=your-api-key|56=KalshiNR|
20131=3|20130=770e8400-e29b-41d4-a716-446655440002|10=125|
```

```fix Trigger Order Group theme={null}
8=FIXT.1.1|9=150|35=UOG|34=8|52=20230809-12:34:59.789|49=your-api-key|56=KalshiNR|
20131=4|20130=770e8400-e29b-41d4-a716-446655440002|10=126|
```

```fix Update Order Group Limit theme={null}
8=FIXT.1.1|9=150|35=UOG|34=9|52=20230809-12:35:00.789|49=your-api-key|56=KalshiNR|
20131=5|20130=770e8400-e29b-41d4-a716-446655440002|20132=2500|10=127|
```

## Order Group Response (35=UOH)

Response to order group management requests.

### Response Fields

| Tag   | Name         | Description           |
| ----- | ------------ | --------------------- |
| 20130 | OrderGroupID | ID of the order group |

<Note>
  Errors are returned as BusinessMessageReject (35=j) messages, not in the OrderGroupResponse.
</Note>

### /fix/rfq-messages.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# RFQ Messages

> Request for Quote functionality for market makers

# RFQ (Request for Quote) Messages

## Overview

The RFQ session allows market makers to respond to quote requests from users. The workflow involves:

1. Exchange sends QuoteRequest to market makers
2. Market makers respond with Quote
3. Requester can accept the quote
4. Market maker confirms execution

<Info>
  RFQ sessions use the KalshiRFQ endpoint with retransmission support.
</Info>

## Message Flow

```mermaid  theme={null}
sequenceDiagram
    participant User
    participant Exchange
    participant MarketMaker

    User->>Exchange: Request Quote (via UI/API)
    Exchange->>MarketMaker: QuoteRequest (35=R)
    MarketMaker->>Exchange: Quote (35=S)
    Exchange->>MarketMaker: QuoteStatusReport (35=AI)<br/>Status=PENDING
    Exchange->>User: Show Quote
    User->>Exchange: Accept Quote
    Exchange->>MarketMaker: QuoteStatusReport (35=AI)<br/>Status=ACCEPTED
    MarketMaker->>Exchange: QuoteConfirm (35=U7)
    Exchange->>MarketMaker: QuoteConfirmStatus (35=U8)
    Exchange->>User: Execute Trade
```

## QuoteRequest (35=R)

This message is sent by Kalshi Exchange back to clients to inform of new quote requests.

| Tag   | Name                             | Type    | Required | Description                                                                                          |
| ----- | -------------------------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------- |
| 131   | QuoteReqId                       | UUID    | Y        | Unique quote request ID                                                                              |
| 146   | NoRelatedSym                     | Integer | Y        | Number of symbols. Currently, only 1 is supported.                                                   |
| 38    | OrderQty                         | Integer | Y        | Number of contracts                                                                                  |
| 152   | CashOrderQty                     | Decimal | N        | Target cost of the quote in dollars.                                                                 |
| 55    | Symbol                           | String  | Y        | Market ticker                                                                                        |
| 453   | NoPartyIDs                       | Integer | N        | Number of parties. Currently, only 1 is supported.                                                   |
| 448   | PartyId                          | UUID    | N        | Pseudonymous identifier for requester                                                                |
| 20180 | MultivariateCollectionTicker     | String  | N        | Collection ticker for multivariate markets                                                           |
| 20181 | NoMultivariateSelectedLegs       | Integer | N        | Number of selected legs for multivariate markets. Repeating group containing the following 3 fields. |
| 20182 | MultivariateSelectedEventTicker  | String  | N        | Event ticker for the selected leg                                                                    |
| 20183 | MultivariateSelectedMarketTicker | String  | N        | Market ticker for the selected leg                                                                   |
| 20184 | MultivariateSelectedMarketSide   | String  | N        | Side for the selected leg ("yes" or "no")                                                            |

## Quote (35=S)

Used to submit a quote in response to a quote request. If a new Quote is created when an existing quote for the same market already exists for the user,
the exchange will cancel the existing quote.

| Tag | Name         | Type    | Required | Description                                                                                    |
| --- | ------------ | ------- | -------- | ---------------------------------------------------------------------------------------------- |
| 117 | QuoteId      | UUID    | Y        | Unique quote identifier                                                                        |
| 131 | QuoteReqId   | UUID    | Y        | Quote request for which the quote is in response to.                                           |
| 55  | Symbol       | String  | Y        | Market ticker                                                                                  |
| 132 | BidPx        | Integer | Y        | Yes price in cents. Only integer part considered (1-99)                                        |
| 133 | OfferPx      | Integer | Y        | No price in cents. Only integer part considered (1-99)                                         |
| 79  | AllocAccount | Integer | N        | Subaccount number (0-32). If provided, the quote will be created for the specified subaccount. |

<Warning>
  Either BidPx or OfferPx can be zero, but not both. Zero indicates no quote for that side.
</Warning>

## QuoteStatusReport (35=AI)

A QuoteStatusReport is sent by the exchange:

1. In response to a Quote. Status will be PENDING if processed, or REJECTED if rejected
2. When the requester accepts the quote. Status will be ACCEPTED. Quoter should reply with QuoteConfirm within 30 seconds
3. In response to a QuoteCancel. Status will be CANCELLED

| Tag | Name         | Type    | Required | Description                                                                 |
| --- | ------------ | ------- | -------- | --------------------------------------------------------------------------- |
| 117 | QuoteId      | String  | Y        | Quote identifier (empty if rejected)                                        |
| 131 | QuoteReqId   | String  | Y        | Request reference                                                           |
| 79  | AllocAccount | Integer | C        | Subaccount number (0-32). Present if the quote was created for a subaccount |
| 297 | QuoteStatus  | Integer | Y        | Current status                                                              |
| 38  | OrderQty     | Integer | C        | Number of contracts. Not present if REJECTED                                |
| 132 | BidPx        | Integer | C        | Yes price in cents. Only integer part considered. Not present if REJECTED   |
| 133 | OfferPx      | Integer | C        | No price in cents. Only integer part considered. Not present if REJECTED    |
| 54  | AcceptedSide | Char    | C        | Side accepted (1=Yes, 2=No). Only present if ACCEPTED                       |
| 58  | Text         | String  | C        | Rejection reason. Only present if REJECTED                                  |

### Quote Status Values (297)

* **ACCEPTED\<0>**: Requester accepted the quote
* **REJECTED\<5>**: Exchange rejected the quote
* **PENDING\<10>**: Quote processed, awaiting action
* **CANCELLED\<17>**: Quote cancelled

## QuoteCancel (35=Z)

Market maker cancels an active quote.

| Tag | Name    | Type   | Required | Description     |
| --- | ------- | ------ | -------- | --------------- |
| 117 | QuoteId | String | Y        | Quote to cancel |

<Note>
  Exchange responds with QuoteStatusReport (Status=CANCELLED).
</Note>

## QuoteCancelStatus (35=U9)

Response to QuoteCancel from exchange.

| Tag | Name              | Type    | Required | Description                              |
| --- | ----------------- | ------- | -------- | ---------------------------------------- |
| 117 | QuoteId           | String  | Y        | Quote identifier                         |
| 298 | QuoteCancelStatus | Integer | Y        | CANCELED(0) or REJECTED(1)               |
| 58  | RejectReason      | String  | C        | Present if QuoteCancelStatus is REJECTED |

## QuoteConfirm (35=U7)

Market maker confirms willingness to execute after quote acceptance.

| Tag | Name    | Type   | Required | Description       |
| --- | ------- | ------ | -------- | ----------------- |
| 117 | QuoteId | String | Y        | Accepted quote ID |

<Warning>
  Quote must be confirmed within 30 seconds of acceptance or it will be voided.
</Warning>

## QuoteConfirmStatus (35=U8)

Exchange response to quote confirmation.

| Tag   | Name               | Type    | Required | Description                               |
| ----- | ------------------ | ------- | -------- | ----------------------------------------- |
| 117   | QuoteId            | String  | Y        | Quote identifier                          |
| 21010 | QuoteConfirmStatus | Integer | Y        | ACCEPTED(0) or REJECTED(1)                |
| 58    | RejectReason       | String  | C        | Present if QuoteConfirmStatus is REJECTED |

## QuoteRequestReject (35=AG)

Exchange notifies that a quote request was cancelled.

| Tag | Name                     | Type    | Required | Description                         |
| --- | ------------------------ | ------- | -------- | ----------------------------------- |
| 58  | Text                     | String  | Y        | Reason the quote has been cancelled |
| 131 | QuoteReqId               | String  | Y        | Request identifier                  |
| 658 | QuoteRequestRejectReason | Integer | Y        | OTHER(99)                           |

<Info>
  Market makers do not send QuoteRequestReject when ignoring a request.
</Info>

## Best Practices

### For Market Makers

1. **Response Time**
   * Respond to quote requests promptly
   * Confirm accepted quotes within 30 seconds
   * Cancel stale quotes proactively

2. **Quote Management**
   * Track active quotes locally
   * Handle quote replacements properly
   * Monitor for acceptance notifications

3. **Risk Management**
   * Validate prices before quoting
   * Implement position limits
   * Handle partial quotes (one-sided)

### Error Handling

1. **Rejection Scenarios**
   * Invalid price range
   * Symbol not found
   * Technical issues

2. **Timeout Handling**
   * 30-second confirmation window
   * Automatic quote expiration
   * Network disconnection recovery

## Example Workflow

<CodeGroup>
  ```fix QuoteRequest from Exchange theme={null}
  8=FIXT.1.1|35=R|131=req-123|146=1|38=100|55=HIGHNY-23DEC31|453=1|448=anon-456|
  ```

  ```fix Quote Response theme={null}
  8=FIXT.1.1|35=S|117=quote-789|131=req-123|55=HIGHNY-23DEC31|132=75|133=25|
  ```

  ```fix Quote Accepted theme={null}
  8=FIXT.1.1|35=AI|117=quote-789|131=req-123|297=0|54=1|38=100|
  ```

  ```fix Quote Confirmation theme={null}
  8=FIXT.1.1|35=U7|117=quote-789|
  ```
</CodeGroup>

## Integration Notes

* RFQ session requires separate connection
* Uses KalshiRFQ endpoint
* Independent of order entry session

### /fix/session-management.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Session Management

> Managing FIX sessions including logon, logout, and message sequencing

# Session Management

## Creating FIX API Keys

### Generate RSA Key Pair

First, generate a 2048 bit RSA PKCS#8 key pair:

```bash  theme={null}
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out kalshi-fix.key
openssl rsa -in kalshi-fix.key -pubout -out kalshi-fix.pub
```

This creates two files:

* **kalshi-fix.key**: Your private key (keep secure, never share)
* **kalshi-fix.pub**: Your public key (share with Kalshi)

### Create API Key

1. Navigate to [https://demo.kalshi.co/account/profile](https://demo.kalshi.co/account/profile)
2. Click the "Create key" button
3. Name your API Key
4. Copy and paste the contents of `kalshi-fix.pub` into the "RSA public key" field
5. Click "Create"
6. Copy the generated FIX API Key (UUID format)

<Warning>
  Store your private key securely. It is equivalent to your username + password and should never be sent to anyone, including Kalshi employees.
</Warning>

## Logon Process

### Logon Message (35=A)

The initiator must send a Logon message to establish a session. The acceptor will either:

* Respond with a Logon message acknowledging successful logon
* Respond with a Logout (35=5) message if the logon fails

### Required Fields

| Tag  | Name             | Description                    | Value                    |
| ---- | ---------------- | ------------------------------ | ------------------------ |
| 98   | EncryptMethod    | Method of encryption           | None\<0>                 |
| 96   | RawData          | Client logon message signature | Base64 encoded signature |
| 108  | HeartbeatInt     | Heartbeat interval (seconds)   | N > 3                    |
| 1137 | DefaultApplVerID | Default application version    | FIX50SP2\<9>             |

### Optional Fields

| Tag   | Name                     | Description                                                                                                                 | Default |
| ----- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------- |
| 141   | ResetSeqNumFlag          | Reset sequence numbers on logon. **Must be Y for KalshiNR, KalshiDC, KalshiPT.**                                            | N       |
| 108   | HeartbeatInt             | Heartbeat \<0> interval (seconds)                                                                                           | 30      |
| 8013  | CancelOrdersOnDisconnect | Cancel orders on any disconnection (including graceful logout)                                                              | N       |
| 20126 | ListenerSession          | Listen-only session (KalshiNR/RT only, requires SkipPendingExecReports=Y)                                                   | N       |
| 20127 | ReceiveSettlementReports | Receive settlement reports (KalshiRT only)                                                                                  | N       |
| 20200 | MessageRetentionPeriod   | How long session messages will be store for retransmission (KalshiRT and KalshiRFQ only), max of 72.                        | 24      |
| 21011 | SkipPendingExecReports   | Skip PENDING\_\{NEW\|REPLACE\|CANCEL} execution reports                                                                     | N       |
| 21012 | UseExpiredOrdStatus      | Emit Expired\<C> (150/39) for expiry-style system cancellations (CloseCancel and OrderExpiryCancel) instead of Canceled\<4> | N       |
| 21007 | EnableIocCancelReport    | Partially filled IOC orders produce a cancel report                                                                         | N       |
| 21008 | PreserveOriginalOrderQty | OrderQty tag 38 always reflects original order quantity across all states                                                   | N       |

### Signature Generation

The RawData field must contain a PSS RSA signature of the pre-hash string:

```
PreHashString = SendingTime + SOH + MsgType + SOH + MsgSeqNum + SOH + SenderCompID + SOH + TargetCompID
```

<Warning>
  **Critical: SendingTime in Signature**

  The SendingTime in the PreHashString must match **exactly** the value in field 52 of your logon message.

  * **Using a FIX library:** Most libraries auto-add SendingTime. Use that exact value (don't manually add a timestamp) when generating the signature.
  * **Building the message yourself:** Include SendingTime in your message and use that same value in the PreHashString. Format: `YYYYMMDD-HH:MM:SS.mmm`
</Warning>

<CodeGroup>
  ```python Python theme={null}
  from base64 import b64encode
  from Cryptodome.Signature import pss
  from Cryptodome.Hash import SHA256
  from Cryptodome.PublicKey import RSA

  # Load private key
  private_key = RSA.import_key(open('kalshi-fix.key').read().encode('utf-8'))

  # Build message string
  # IMPORTANT: Use the EXACT SendingTime that will appear in field 52
  # If constructing the message yourself: generate SendingTime and use it here
  # If using a library: use the SendingTime value that your library will set
  sending_time = "20230809-05:28:18.035"
  msg_type = "A"
  msg_seq_num = "1"
  sender_comp_id = "your-fix-api-key-uuid"
  target_comp_id = "Kalshi"  # Or appropriate TargetCompID

  msg_string = chr(1).join([
      sending_time, msg_type, msg_seq_num,
      sender_comp_id, target_comp_id
  ])

  # Generate signature
  msg_hash = SHA256.new(msg_string.encode('utf-8'))
  signature = pss.new(private_key).sign(msg_hash)
  raw_data_value = b64encode(signature).decode('utf-8')
  ```
</CodeGroup>

## Session Maintenance

### Heartbeat Protocol

* Default interval: 30 seconds
* Both sides must respond to TestRequest messages
* Connection terminates if heartbeat response not received within interval

### Message Sequence Numbers

#### Sequence Number Rules

1. Must be unique and increase by one for each message
2. Empty MsgSeqNum results in session termination
3. Lower than expected = serious failure, connection terminated
4. Higher than expected = recoverable with ResendRequest (if supported)

### Reconnection Procedure

For unexpected sequence numbers:

1. Document the issue with logs for out-of-band communication
2. Check order status via REST API or UI
3. Establish new session with reset sequence numbers

## ResendRequest (35=2)

<Note>
  Only available on Order Entry with Retransmission (KalshiRT) sessions.
</Note>

### Limitations

* Lookback window limited to 24 hours (or up to 72 hours if MessageRetentionPeriod was set on Logon request)
* If you provide a BeginSeqNo that is beyond the lookback window, you will receive a Reject message

| Tag | Name       | Description             |
| --- | ---------- | ----------------------- |
| 7   | BeginSeqNo | Lower bound (inclusive) |
| 16  | EndSeqNo   | Upper bound (inclusive) |

## Error Handling

### Reject (35=3)

Sent when a message cannot be processed due to session-level rule violations.

| Tag | Name                | Description                         | Required |
| --- | ------------------- | ----------------------------------- | -------- |
| 45  | RefSeqNum           | Sequence number of rejected message | Yes      |
| 58  | Text                | Human-readable error description    | No       |
| 371 | RefTagID            | Tag number that caused reject       | No       |
| 372 | RefMsgType          | MsgType of referenced message       | No       |
| 373 | SessionRejectReason | Rejection reason code               | No       |

<Note>
  Reject indicates serious errors that may result from faulty logic. Log and investigate these errors.
</Note>

### BusinessMessageReject (35=j)

Sent for business logic violations rather than session-level errors.

| Tag | Name                 | Description                           | Required |
| --- | -------------------- | ------------------------------------- | -------- |
| 45  | RefSeqNum            | Sequence number of rejected message   | Yes      |
| 58  | Text                 | Human-readable error description      | No       |
| 371 | RefTagID             | Tag number that caused reject         | No       |
| 372 | RefMsgType           | MsgType of referenced message         | No       |
| 379 | BusinessRejectRefID  | Business-level ID of rejected message | No       |
| 380 | BusinessRejectReason | Business rejection reason code        | Yes      |

## Session Termination

### Logout (35=5)

Graceful session termination:

1. Initiator sends Logout message
2. Acceptor responds with Logout (empty Text field)
3. Transport layer connection terminated

| Tag | Name | Description                |
| --- | ---- | -------------------------- |
| 58  | Text | Error description (if any) |

<Warning>
  If `CancelOrdersOnDisconnect=Y`, all orders are canceled even on graceful logout.
</Warning>

## Message Headers

All messages must include standard FIX headers:

| Tag | Name        | Description             | Requirements                      |
| --- | ----------- | ----------------------- | --------------------------------- |
| 8   | BeginString | Protocol version        | FIXT.1.1 (must be first)          |
| 9   | BodyLength  | Message length in bytes | Must be second                    |
| 34  | MsgSeqNum   | Message sequence number | Unique, incrementing              |
| 35  | MsgType     | Message type            | Must be third                     |
| 52  | SendingTime | UTC timestamp           | Within 120 seconds of server time |

### Message Trailers

| Tag | Name     | Description           |                    |
| --- | -------- | --------------------- | ------------------ |
| 10  | CheckSum | Standard FIX checksum | Must be last field |

<Info>
  CheckSum is calculated by summing ASCII values of all characters (except checksum field) modulo 256.
</Info>

## Best Practices

1. **Session Configuration**
   * Use unique ClOrdIDs across all message types
   * Implement proper heartbeat handling
   * Monitor sequence numbers carefully

2. **Error Recovery**
   * Implement automatic reconnection logic
   * Store order state locally for recovery
   * Use drop copy session for missed messages

3. **Security**
   * Rotate API keys periodically
   * Monitor for unauthorized access
   * Use secure storage for private keys

### /fix/subpenny-pricing.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Subpenny Pricing

> Dollar-based pricing format for subpenny precision

For the general overview of fixed-point pricing and contract quantities across REST and WebSocket APIs, see [Fixed-Point Migration](/getting_started/fixed_point_migration).

## Technical Specification

To enable subpenny precision, include tag **21005** in your Logon message:

| Tag   | Name       | Description                      | Value |
| ----- | ---------- | -------------------------------- | ----- |
| 21005 | UseDollars | Enable dollar-based price format | Y     |

Overview:

* **Legacy Format (Cents)**: Prices given in whole cents. E.g. 72 cents = `72`.
* **New Format (Dollars)**: Prices normalized to dollars with fixed precision (up to 4 decimal places).

Examples:

| Cents | FIX Decimal       | String Representation |
| ----- | ----------------- | --------------------- |
| 1.23¢ | Decimal(123, -4)  | 0.0123                |
| 72.5¢ | Decimal(7250, -4) | 0.725                 |
| 99¢   | Decimal(9900, -4) | 0.99                  |

Affected Tags:

| Tag | Field Name | Description            |
| --- | ---------- | ---------------------- |
| 6   | AvgPx      | Average price of fills |
| 31  | LastPx     | Price of last fill     |
| 44  | Price      | Order limit price      |
| 132 | BidPx      | Quote bid price        |
| 133 | OfferPx    | Quote ask price        |

## Sample Messages

<CodeGroup>
  ```FIX logon theme={null}
  8=FIXT.1.1|9=300|35=A|34=1|52=20250926-21:54:07.001|
  96=QhA8659Mhygcm+xE/wb1m...|21005=Y|
                              ^^ Enable dollar format
  ```
</CodeGroup>

<CodeGroup>
  ```FIX new order single theme={null}
  8=FIXT.1.1|9=200|35=D|34=2|52=20250926-21:54:16.040|
  38=100.0|40=2|44=0.7500|54=1|60=20250926-21:54:16.040|
                ^^ price
  10=092|
  ```
</CodeGroup>

<CodeGroup>
  ```FIX execution report theme={null}
  8=FIXT.1.1|9=400|35=8|34=4|52=20250926-21:54:16.159|
  6=0.6600|14=100|31=0.7000|32=60|38=100.0000|39=2|44=0.7500|
  ^^ avgPx        ^^ lastPx                        ^^ price
  ```
</CodeGroup>

### SDKs

+----+---------------------------------------------------+
| No | Page                                              |
+----+---------------------------------------------------+
| 1  | /sdks/overview.md                                 |
| 2  | /python-sdk/api/ApiKeysApi.md                     |
| 3  | /python-sdk/api/CommunicationsApi.md              |
| 4  | /python-sdk/api/EventsApi.md                      |
| 5  | /python-sdk/api/ExchangeApi.md                    |
| 6  | /python-sdk/api/MarketsApi.md                     |
| 7  | /python-sdk/api/MilestonesApi.md                  |
| 8  | /python-sdk/api/MultivariateCollectionsApi.md     |
| 9  | /python-sdk/api/PortfolioApi.md                   |
| 10 | /python-sdk/api/SeriesApi.md                      |
| 11 | /python-sdk/api/StructuredTargetsApi.md           |
| 12 | /sdks/python/quickstart.md                        |
| 13 | /sdks/typescript/quickstart.md                    |
| 14 | /typescript-sdk/api/ApiKeysApi.md                 |
| 15 | /typescript-sdk/api/CommunicationsApi.md          |
| 16 | /typescript-sdk/api/EventsApi.md                  |
| 17 | /typescript-sdk/api/ExchangeApi.md                |
| 18 | /typescript-sdk/api/MarketsApi.md                 |
| 19 | /typescript-sdk/api/MilestonesApi.md              |
| 20 | /typescript-sdk/api/MultivariateCollectionsApi.md |
| 21 | /typescript-sdk/api/PortfolioApi.md               |
| 22 | /typescript-sdk/api/SeriesApi.md                  |
| 23 | /typescript-sdk/api/StructuredTargetsApi.md       |
+----+---------------------------------------------------+

### /sdks/overview.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kalshi SDKs

> Official SDKs for integrating with the Kalshi API

## Available SDKs

Kalshi provides official SDKs to make integration easier. Each SDK provides full access to the Kalshi API with language-specific conventions and best practices.

<CardGroup cols={2}>
  <Card title="Python" icon="python" href="/sdks/python/quickstart">
    Full-featured Python SDK with async support
  </Card>

  <Card title="TypeScript" icon="js" href="/sdks/typescript/quickstart">
    TypeScript/JavaScript SDK for Node.js and browsers
  </Card>
</CardGroup>

## Versioning and Updates

SDK versions are aligned with the [OpenAPI specification](https://docs.kalshi.com/openapi.yaml). New SDK releases are generally published on Tuesdays or Wednesdays each week, in advance of any corresponding API changes going live. However, release timing may vary and is not guaranteed. We recommend checking the SDK package repositories and the [API Changelog](/changelog) for the latest updates.

These SDKs are intended to help developers get started quickly with the Kalshi API. For production applications, we recommend generating your own client libraries from the [OpenAPI specification](https://docs.kalshi.com/openapi.yaml) or implementing direct API integration to ensure full control over your implementation.

## Features

All SDKs provide:

* Full API coverage for trading, market data, and portfolio management
* Authentication with RSA-PSS signing
* Automatic request signing and timestamp handling
* Type-safe models and responses
* Error handling and retries
* Comprehensive documentation and examples

## Installation

<CodeGroup>
  ```bash Python (sync) theme={null}
  pip install kalshi_python_sync
  ```

  ```bash Python (async) theme={null}
  pip install kalshi_python_async
  ```

  ```bash TypeScript theme={null}
  npm install kalshi-typescript
  ```
</CodeGroup>

<Note>
  The old `kalshi-python` package is deprecated. Please migrate to `kalshi-python-sync` or `kalshi-python-async`.
</Note>

## Authentication

All SDKs use the same authentication mechanism with API keys and RSA-PSS signing. You'll need:

1. An API key ID from your Kalshi account
2. A private key file for signing requests

See the quickstart guide for your chosen SDK for detailed setup instructions.

### /python-sdk/api/ApiKeysApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ApiKeys

> Python SDK methods for ApiKeys operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                      | HTTP request                    | Description      |
| ------------------------------------------- | ------------------------------- | ---------------- |
| [**create\_api\_key**](#create-api-key)     | **POST** /api\_keys             | Create API Key   |
| [**delete\_api\_key**](#delete-api-key)     | **DELETE** /api\_keys/{api_key} | Delete API Key   |
| [**generate\_api\_key**](#generate-api-key) | **POST** /api\_keys/generate    | Generate API Key |
| [**get\_api\_keys**](#get-api-keys)         | **GET** /api\_keys              | Get API Keys     |

# **create\_api\_key**

> CreateApiKeyResponse create\_api\_key(create\_api\_key\_request)

Create API Key

Endpoint for creating a new API key with a user-provided public key.  This endpoint allows users with Premier or Market Maker API usage levels to create API keys by providing their own RSA public key. The platform will use this public key to verify signatures on API requests.

### Parameters

| Name                          | Type                                                                                     | Description | Notes |
| ----------------------------- | ---------------------------------------------------------------------------------------- | ----------- | ----- |
| **create\_api\_key\_request** | [**CreateApiKeyRequest**](https://docs.kalshi.com/python-sdk/models/CreateApiKeyRequest) |             |       |

### Return type

[**CreateApiKeyResponse**](https://docs.kalshi.com/python-sdk/models/CreateApiKeyResponse)

### HTTP response details

| Status code | Description                              |
| ----------- | ---------------------------------------- |
| **201**     | API key created successfully             |
| **400**     | Bad request - invalid input              |
| **401**     | Unauthorized                             |
| **403**     | Forbidden - insufficient API usage level |
| **500**     | Internal server error                    |

# **delete\_api\_key**

> delete\_api\_key(api\_key)

Delete API Key

Endpoint for deleting an existing API key.  This endpoint permanently deletes an API key. Once deleted, the key can no longer be used for authentication. This action cannot be undone.

### Parameters

| Name         | Type    | Description          | Notes |
| ------------ | ------- | -------------------- | ----- |
| **api\_key** | **str** | API key ID to delete |       |

### Return type

void (empty response body)

### HTTP response details

| Status code | Description                      |
| ----------- | -------------------------------- |
| **204**     | API key successfully deleted     |
| **400**     | Bad request - invalid API key ID |
| **401**     | Unauthorized                     |
| **404**     | API key not found                |
| **500**     | Internal server error            |

# **generate\_api\_key**

> GenerateApiKeyResponse generate\_api\_key(generate\_api\_key\_request)

Generate API Key

Endpoint for generating a new API key with an automatically created key pair.  This endpoint generates both a public and private RSA key pair. The public key is stored on the platform, while the private key is returned to the user and must be stored securely. The private key cannot be retrieved again.

### Parameters

| Name                            | Type                                                                                         | Description | Notes |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ----------- | ----- |
| **generate\_api\_key\_request** | [**GenerateApiKeyRequest**](https://docs.kalshi.com/python-sdk/models/GenerateApiKeyRequest) |             |       |

### Return type

[**GenerateApiKeyResponse**](https://docs.kalshi.com/python-sdk/models/GenerateApiKeyResponse)

### HTTP response details

| Status code | Description                    |
| ----------- | ------------------------------ |
| **201**     | API key generated successfully |
| **400**     | Bad request - invalid input    |
| **401**     | Unauthorized                   |
| **500**     | Internal server error          |

# **get\_api\_keys**

> GetApiKeysResponse get\_api\_keys()

Get API Keys

Endpoint for retrieving all API keys associated with the authenticated user.  API keys allow programmatic access to the platform without requiring username/password authentication. Each key has a unique identifier and name.

### Parameters

This endpoint does not need any parameter.

### Return type

[**GetApiKeysResponse**](https://docs.kalshi.com/python-sdk/models/GetApiKeysResponse)

### HTTP response details

| Status code | Description                             |
| ----------- | --------------------------------------- |
| **200**     | List of API keys retrieved successfully |
| **401**     | Unauthorized                            |
| **500**     | Internal server error                   |

### /python-sdk/api/CommunicationsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Communications

> Python SDK methods for Communications operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                | HTTP request                                      | Description           |
| ----------------------------------------------------- | ------------------------------------------------- | --------------------- |
| [**accept\_quote**](#accept-quote)                    | **PUT** /communications/quotes/{quote_id}/accept  | Accept Quote          |
| [**confirm\_quote**](#confirm-quote)                  | **PUT** /communications/quotes/{quote_id}/confirm | Confirm Quote         |
| [**create\_quote**](#create-quote)                    | **POST** /communications/quotes                   | Create Quote          |
| [**create\_rfq**](#create-rfq)                        | **POST** /communications/rfqs                     | Create RFQ            |
| [**delete\_quote**](#delete-quote)                    | **DELETE** /communications/quotes/{quote_id}      | Delete Quote          |
| [**delete\_rfq**](#delete-rfq)                        | **DELETE** /communications/rfqs/{rfq_id}          | Delete RFQ            |
| [**get\_communications\_id**](#get-communications-id) | **GET** /communications/id                        | Get Communications ID |
| [**get\_quote**](#get-quote)                          | **GET** /communications/quotes/{quote_id}         | Get Quote             |
| [**get\_quotes**](#get-quotes)                        | **GET** /communications/quotes                    | Get Quotes            |
| [**get\_rfq**](#get-rfq)                              | **GET** /communications/rfqs/{rfq_id}             | Get RFQ               |
| [**get\_rfqs**](#get-rfqs)                            | **GET** /communications/rfqs                      | Get RFQs              |

# **accept\_quote**

> accept\_quote(quote\_id, accept\_quote\_request)

Accept Quote

Endpoint for accepting a quote. This will require the quoter to confirm

### Parameters

| Name                       | Type                                                                                   | Description | Notes |
| -------------------------- | -------------------------------------------------------------------------------------- | ----------- | ----- |
| **quote\_id**              | **str**                                                                                | Quote ID    |       |
| **accept\_quote\_request** | [**AcceptQuoteRequest**](https://docs.kalshi.com/python-sdk/models/AcceptQuoteRequest) |             |       |

### Return type

void (empty response body)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **204**     | Quote accepted successfully            |
| **400**     | Bad request - invalid input            |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

# **confirm\_quote**

> confirm\_quote(quote\_id, body=body)

Confirm Quote

Endpoint for confirming a quote. This will start a timer for order execution

### Parameters

| Name          | Type       | Description | Notes       |
| ------------- | ---------- | ----------- | ----------- |
| **quote\_id** | **str**    | Quote ID    |             |
| **body**      | **object** |             | \[optional] |

### Return type

void (empty response body)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **204**     | Quote confirmed successfully           |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

# **create\_quote**

> CreateQuoteResponse create\_quote(create\_quote\_request)

Create Quote

Endpoint for creating a quote in response to an RFQ

### Parameters

| Name                       | Type                                                                                   | Description | Notes |
| -------------------------- | -------------------------------------------------------------------------------------- | ----------- | ----- |
| **create\_quote\_request** | [**CreateQuoteRequest**](https://docs.kalshi.com/python-sdk/models/CreateQuoteRequest) |             |       |

### Return type

[**CreateQuoteResponse**](https://docs.kalshi.com/python-sdk/models/CreateQuoteResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **201**     | Quote created successfully             |
| **400**     | Bad request - invalid input            |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

# **create\_rfq**

> CreateRFQResponse create\_rfq(create\_rfq\_request)

Create RFQ

Endpoint for creating a new RFQ. You can have a maximum of 100 open RFQs at a time.

### Parameters

| Name                     | Type                                                                               | Description | Notes |
| ------------------------ | ---------------------------------------------------------------------------------- | ----------- | ----- |
| **create\_rfq\_request** | [**CreateRFQRequest**](https://docs.kalshi.com/python-sdk/models/CreateRFQRequest) |             |       |

### Return type

[**CreateRFQResponse**](https://docs.kalshi.com/python-sdk/models/CreateRFQResponse)

### HTTP response details

| Status code | Description                                              |
| ----------- | -------------------------------------------------------- |
| **201**     | RFQ created successfully                                 |
| **400**     | Bad request - invalid input                              |
| **401**     | Unauthorized - authentication required                   |
| **409**     | Conflict - resource already exists or cannot be modified |
| **500**     | Internal server error                                    |

# **delete\_quote**

> delete\_quote(quote\_id)

Delete Quote

Endpoint for deleting a quote, which means it can no longer be accepted.

### Parameters

| Name          | Type    | Description | Notes |
| ------------- | ------- | ----------- | ----- |
| **quote\_id** | **str** | Quote ID    |       |

### Return type

void (empty response body)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **204**     | Quote deleted successfully             |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

# **delete\_rfq**

> delete\_rfq(rfq\_id)

Delete RFQ

Endpoint for deleting an RFQ by ID

### Parameters

| Name        | Type    | Description | Notes |
| ----------- | ------- | ----------- | ----- |
| **rfq\_id** | **str** | RFQ ID      |       |

### Return type

void (empty response body)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **204**     | RFQ deleted successfully               |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

# **get\_communications\_id**

> GetCommunicationsIDResponse get\_communications\_id()

Get Communications ID

Endpoint for getting the communications ID of the logged-in user.

### Parameters

This endpoint does not need any parameter.

### Return type

[**GetCommunicationsIDResponse**](https://docs.kalshi.com/python-sdk/models/GetCommunicationsIDResponse)

### HTTP response details

| Status code | Description                              |
| ----------- | ---------------------------------------- |
| **200**     | Communications ID retrieved successfully |
| **401**     | Unauthorized - authentication required   |
| **500**     | Internal server error                    |

# **get\_quote**

> GetQuoteResponse get\_quote(quote\_id)

Get Quote

Endpoint for getting a particular quote

### Parameters

| Name          | Type    | Description | Notes |
| ------------- | ------- | ----------- | ----- |
| **quote\_id** | **str** | Quote ID    |       |

### Return type

[**GetQuoteResponse**](https://docs.kalshi.com/python-sdk/models/GetQuoteResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Quote retrieved successfully           |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

# **get\_quotes**

> GetQuotesResponse get\_quotes(cursor=cursor, event\_ticker=event\_ticker, market\_ticker=market\_ticker, limit=limit, status=status, quote\_creator\_user\_id=quote\_creator\_user\_id, rfq\_creator\_user\_id=rfq\_creator\_user\_id, rfq\_creator\_subtrader\_id=rfq\_creator\_subtrader\_id, rfq\_id=rfq\_id)

Get Quotes

Endpoint for getting quotes

### Parameters

| Name                            | Type    | Description                                                                                                                                  | Notes                         |
| ------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **cursor**                      | **str** | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | \[optional]                   |
| **event\_ticker**               | **str** | Event ticker of desired positions. Multiple event tickers can be provided as a comma-separated list (maximum 10).                            | \[optional]                   |
| **market\_ticker**              | **str** | Filter by market ticker                                                                                                                      | \[optional]                   |
| **limit**                       | **int** | Parameter to specify the number of results per page. Defaults to 500.                                                                        | \[optional] \[default to 500] |
| **status**                      | **str** | Filter quotes by status                                                                                                                      | \[optional]                   |
| **quote\_creator\_user\_id**    | **str** | Filter quotes by quote creator user ID                                                                                                       | \[optional]                   |
| **rfq\_creator\_user\_id**      | **str** | Filter quotes by RFQ creator user ID                                                                                                         | \[optional]                   |
| **rfq\_creator\_subtrader\_id** | **str** | Filter quotes by RFQ creator subtrader ID (FCM members only)                                                                                 | \[optional]                   |
| **rfq\_id**                     | **str** | Filter quotes by RFQ ID                                                                                                                      | \[optional]                   |

### Return type

[**GetQuotesResponse**](https://docs.kalshi.com/python-sdk/models/GetQuotesResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Quotes retrieved successfully          |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

# **get\_rfq**

> GetRFQResponse get\_rfq(rfq\_id)

Get RFQ

Endpoint for getting a single RFQ by id

### Parameters

| Name        | Type    | Description | Notes |
| ----------- | ------- | ----------- | ----- |
| **rfq\_id** | **str** | RFQ ID      |       |

### Return type

[**GetRFQResponse**](https://docs.kalshi.com/python-sdk/models/GetRFQResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | RFQ retrieved successfully             |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

# **get\_rfqs**

> GetRFQsResponse get\_rfqs(cursor=cursor, event\_ticker=event\_ticker, market\_ticker=market\_ticker, limit=limit, status=status, creator\_user\_id=creator\_user\_id)

Get RFQs

Endpoint for getting RFQs

### Parameters

| Name                  | Type    | Description                                                                                                                                  | Notes                         |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **cursor**            | **str** | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | \[optional]                   |
| **event\_ticker**     | **str** | Event ticker of desired positions. Multiple event tickers can be provided as a comma-separated list (maximum 10).                            | \[optional]                   |
| **market\_ticker**    | **str** | Filter by market ticker                                                                                                                      | \[optional]                   |
| **limit**             | **int** | Parameter to specify the number of results per page. Defaults to 100.                                                                        | \[optional] \[default to 100] |
| **status**            | **str** | Filter RFQs by status                                                                                                                        | \[optional]                   |
| **creator\_user\_id** | **str** | Filter RFQs by creator user ID                                                                                                               | \[optional]                   |

### Return type

[**GetRFQsResponse**](https://docs.kalshi.com/python-sdk/models/GetRFQsResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | RFQs retrieved successfully            |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

### /python-sdk/api/EventsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Events

> Python SDK methods for Events operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                                                    | HTTP request                                                                  | Description                           |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| [**get\_event**](#get-event)                                                              | **GET** /events/{event_ticker}                                                | Get Event                             |
| [**get\_event\_forecast\_percentiles\_history**](#get-event-forecast-percentiles-history) | **GET** /series/{series_ticker}/events/{ticker}/forecast\_percentile\_history | Get Event Forecast Percentile History |
| [**get\_event\_metadata**](#get-event-metadata)                                           | **GET** /events/{event_ticker}/metadata                                       | Get Event Metadata                    |
| [**get\_events**](#get-events)                                                            | **GET** /events                                                               | Get Events                            |
| [**get\_market\_candlesticks\_by\_event**](#get-market-candlesticks-by-event)             | **GET** /series/{series_ticker}/events/{ticker}/candlesticks                  | Get Event Candlesticks                |
| [**get\_multivariate\_events**](#get-multivariate-events)                                 | **GET** /events/multivariate                                                  | Get Multivariate Events               |

# **get\_event**

> GetEventResponse get\_event(event\_ticker, with\_nested\_markets=with\_nested\_markets)

Get Event

Endpoint for getting data about an event by its ticker.  An event represents a real-world occurrence that can be traded on, such as an election, sports game, or economic indicator release. Events contain one or more markets where users can place trades on different outcomes.

### Parameters

| Name                      | Type     | Description                                                                                                                                    | Notes                           |
| ------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **event\_ticker**         | **str**  | Event ticker                                                                                                                                   |                                 |
| **with\_nested\_markets** | **bool** | If true, markets are included within the event object. If false (default), markets are returned as a separate top-level field in the response. | \[optional] \[default to False] |

### Return type

[**GetEventResponse**](https://docs.kalshi.com/python-sdk/models/GetEventResponse)

### HTTP response details

| Status code | Description                  |
| ----------- | ---------------------------- |
| **200**     | Event retrieved successfully |
| **400**     | Bad request                  |
| **404**     | Event not found              |
| **401**     | Unauthorized                 |
| **500**     | Internal server error        |

# **get\_event\_forecast\_percentiles\_history**

> GetEventForecastPercentilesHistoryResponse get\_event\_forecast\_percentiles\_history(ticker, series\_ticker, percentiles, start\_ts, end\_ts, period\_interval)

Get Event Forecast Percentile History

Endpoint for getting the historical raw and formatted forecast numbers for an event at specific percentiles.

### Parameters

| Name                 | Type                                                             | Description                                                                                                                       | Notes |
| -------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **ticker**           | **str**                                                          | The event ticker                                                                                                                  |       |
| **series\_ticker**   | **str**                                                          | The series ticker                                                                                                                 |       |
| **percentiles**      | [**List\[int\]**](https://docs.kalshi.com/python-sdk/models/int) | Array of percentile values to retrieve (0-10000, max 10 values)                                                                   |       |
| **start\_ts**        | **int**                                                          | Start timestamp for the range                                                                                                     |       |
| **end\_ts**          | **int**                                                          | End timestamp for the range                                                                                                       |       |
| **period\_interval** | **int**                                                          | Specifies the length of each forecast period, in minutes. 0 for 5-second intervals, or 1, 60, or 1440 for minute-based intervals. |       |

### Return type

[**GetEventForecastPercentilesHistoryResponse**](https://docs.kalshi.com/python-sdk/models/GetEventForecastPercentilesHistoryResponse)

### HTTP response details

| Status code | Description                                              |
| ----------- | -------------------------------------------------------- |
| **200**     | Event forecast percentile history retrieved successfully |
| **400**     | Bad request                                              |
| **401**     | Unauthorized                                             |
| **500**     | Internal server error                                    |

# **get\_event\_metadata**

> GetEventMetadataResponse get\_event\_metadata(event\_ticker)

Get Event Metadata

Endpoint for getting metadata about an event by its ticker.  Returns only the metadata information for an event.

### Parameters

| Name              | Type    | Description  | Notes |
| ----------------- | ------- | ------------ | ----- |
| **event\_ticker** | **str** | Event ticker |       |

### Return type

[**GetEventMetadataResponse**](https://docs.kalshi.com/python-sdk/models/GetEventMetadataResponse)

### HTTP response details

| Status code | Description                           |
| ----------- | ------------------------------------- |
| **200**     | Event metadata retrieved successfully |
| **400**     | Bad request                           |
| **404**     | Event not found                       |
| **401**     | Unauthorized                          |
| **500**     | Internal server error                 |

# **get\_events**

> GetEventsResponse get\_events(limit=limit, cursor=cursor, with\_nested\_markets=with\_nested\_markets, with\_milestones=with\_milestones, status=status, series\_ticker=series\_ticker, min\_close\_ts=min\_close\_ts)

Get Events

Filter by event status. Possible values: 'open', 'closed', 'settled'. Leave empty to return events with any status.

### Parameters

| Name                      | Type     | Description                                                                                                                                                                                     | Notes                           |
| ------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **limit**                 | **int**  | Parameter to specify the number of results per page. Defaults to 200. Maximum value is 200.                                                                                                     | \[optional] \[default to 200]   |
| **cursor**                | **str**  | Parameter to specify the pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page.                           | \[optional]                     |
| **with\_nested\_markets** | **bool** | Parameter to specify if nested markets should be included in the response. When true, each event will include a 'markets' field containing a list of Market objects associated with that event. | \[optional] \[default to False] |
| **with\_milestones**      | **bool** | If true, includes related milestones as a field alongside events.                                                                                                                               | \[optional] \[default to False] |
| **status**                | **str**  | Filter by event status. Possible values are 'open', 'closed', 'settled'. Leave empty to return events with any status.                                                                          | \[optional]                     |
| **series\_ticker**        | **str**  | Filter by series ticker                                                                                                                                                                         | \[optional]                     |
| **min\_close\_ts**        | **int**  | Filter events with at least one market with close timestamp greater than this Unix timestamp (in seconds).                                                                                      | \[optional]                     |

### Return type

[**GetEventsResponse**](https://docs.kalshi.com/python-sdk/models/GetEventsResponse)

### HTTP response details

| Status code | Description                   |
| ----------- | ----------------------------- |
| **200**     | Events retrieved successfully |
| **400**     | Bad request                   |
| **401**     | Unauthorized                  |
| **500**     | Internal server error         |

# **get\_market\_candlesticks\_by\_event**

> GetEventCandlesticksResponse get\_market\_candlesticks\_by\_event(ticker, series\_ticker, start\_ts, end\_ts, period\_interval)

Get Event Candlesticks

End-point for returning aggregated data across all markets corresponding to an event.

### Parameters

| Name                 | Type    | Description                                                                                            | Notes |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------ | ----- |
| **ticker**           | **str** | The event ticker                                                                                       |       |
| **series\_ticker**   | **str** | The series ticker                                                                                      |       |
| **start\_ts**        | **int** | Start timestamp for the range                                                                          |       |
| **end\_ts**          | **int** | End timestamp for the range                                                                            |       |
| **period\_interval** | **int** | Specifies the length of each candlestick period, in minutes. Must be one minute, one hour, or one day. |       |

### Return type

[**GetEventCandlesticksResponse**](https://docs.kalshi.com/python-sdk/models/GetEventCandlesticksResponse)

### HTTP response details

| Status code | Description                               |
| ----------- | ----------------------------------------- |
| **200**     | Event candlesticks retrieved successfully |
| **400**     | Bad request                               |
| **401**     | Unauthorized                              |
| **500**     | Internal server error                     |

# **get\_multivariate\_events**

> GetMultivariateEventsResponse get\_multivariate\_events(limit=limit, cursor=cursor, series\_ticker=series\_ticker, collection\_ticker=collection\_ticker, with\_nested\_markets=with\_nested\_markets)

Get Multivariate Events

Retrieve multivariate (combo) events. These are dynamically created events from multivariate event collections. Supports filtering by series and collection ticker.

### Parameters

| Name                      | Type     | Description                                                                                                                                                                                     | Notes                           |
| ------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **limit**                 | **int**  | Number of results per page. Defaults to 100. Maximum value is 200.                                                                                                                              | \[optional] \[default to 100]   |
| **cursor**                | **str**  | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results.                                                                                    | \[optional]                     |
| **series\_ticker**        | **str**  | Filter by series ticker                                                                                                                                                                         | \[optional]                     |
| **collection\_ticker**    | **str**  | Filter events by collection ticker. Returns only multivariate events belonging to the specified collection. Cannot be used together with series\_ticker.                                        | \[optional]                     |
| **with\_nested\_markets** | **bool** | Parameter to specify if nested markets should be included in the response. When true, each event will include a 'markets' field containing a list of Market objects associated with that event. | \[optional] \[default to False] |

### Return type

[**GetMultivariateEventsResponse**](https://docs.kalshi.com/python-sdk/models/GetMultivariateEventsResponse)

### HTTP response details

| Status code | Description                                |
| ----------- | ------------------------------------------ |
| **200**     | Multivariate events retrieved successfully |
| **400**     | Bad request - invalid parameters           |
| **401**     | Unauthorized                               |
| **500**     | Internal server error                      |

### /python-sdk/api/ExchangeApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Exchange

> Python SDK methods for Exchange operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                          | HTTP request                            | Description                |
| --------------------------------------------------------------- | --------------------------------------- | -------------------------- |
| [**get\_exchange\_announcements**](#get-exchange-announcements) | **GET** /exchange/announcements         | Get Exchange Announcements |
| [**get\_exchange\_schedule**](#get-exchange-schedule)           | **GET** /exchange/schedule              | Get Exchange Schedule      |
| [**get\_exchange\_status**](#get-exchange-status)               | **GET** /exchange/status                | Get Exchange Status        |
| [**get\_series\_fee\_changes**](#get-series-fee-changes)        | **GET** /series/fee\_changes            | Get Series Fee Changes     |
| [**get\_user\_data\_timestamp**](#get-user-data-timestamp)      | **GET** /exchange/user\_data\_timestamp | Get User Data Timestamp    |

# **get\_exchange\_announcements**

> GetExchangeAnnouncementsResponse get\_exchange\_announcements()

Get Exchange Announcements

Endpoint for getting all exchange-wide announcements.

### Parameters

This endpoint does not need any parameter.

### Return type

[**GetExchangeAnnouncementsResponse**](https://docs.kalshi.com/python-sdk/models/GetExchangeAnnouncementsResponse)

### HTTP response details

| Status code | Description                                   |
| ----------- | --------------------------------------------- |
| **200**     | Exchange announcements retrieved successfully |
| **500**     | Internal server error                         |

# **get\_exchange\_schedule**

> GetExchangeScheduleResponse get\_exchange\_schedule()

Get Exchange Schedule

Endpoint for getting the exchange schedule.

### Parameters

This endpoint does not need any parameter.

### Return type

[**GetExchangeScheduleResponse**](https://docs.kalshi.com/python-sdk/models/GetExchangeScheduleResponse)

### HTTP response details

| Status code | Description                              |
| ----------- | ---------------------------------------- |
| **200**     | Exchange schedule retrieved successfully |
| **500**     | Internal server error                    |

# **get\_exchange\_status**

> ExchangeStatus get\_exchange\_status()

Get Exchange Status

Endpoint for getting the exchange status.

### Parameters

This endpoint does not need any parameter.

### Return type

[**ExchangeStatus**](https://docs.kalshi.com/python-sdk/models/ExchangeStatus)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Exchange status retrieved successfully |
| **500**     | Internal server error                  |
| **503**     | Service unavailable                    |
| **504**     | Gateway timeout                        |

# **get\_series\_fee\_changes**

> GetSeriesFeeChangesResponse get\_series\_fee\_changes(series\_ticker=series\_ticker, show\_historical=show\_historical)

Get Series Fee Changes

### Parameters

| Name                 | Type     | Description | Notes                           |
| -------------------- | -------- | ----------- | ------------------------------- |
| **series\_ticker**   | **str**  |             | \[optional]                     |
| **show\_historical** | **bool** |             | \[optional] \[default to False] |

### Return type

[**GetSeriesFeeChangesResponse**](https://docs.kalshi.com/python-sdk/models/GetSeriesFeeChangesResponse)

### HTTP response details

| Status code | Description                               |
| ----------- | ----------------------------------------- |
| **200**     | Series fee changes retrieved successfully |
| **400**     | Bad request - invalid input               |
| **500**     | Internal server error                     |

# **get\_user\_data\_timestamp**

> GetUserDataTimestampResponse get\_user\_data\_timestamp()

Get User Data Timestamp

There is typically a short delay before exchange events are reflected in the API endpoints. Whenever possible, combine API responses to PUT/POST/DELETE requests with websocket data to obtain the most accurate view of the exchange state. This endpoint provides an approximate indication of when the data from the following endpoints was last validated: GetBalance, GetOrder(s), GetFills, GetPositions

### Parameters

This endpoint does not need any parameter.

### Return type

[**GetUserDataTimestampResponse**](https://docs.kalshi.com/python-sdk/models/GetUserDataTimestampResponse)

### HTTP response details

| Status code | Description                                |
| ----------- | ------------------------------------------ |
| **200**     | User data timestamp retrieved successfully |
| **500**     | Internal server error                      |

### /python-sdk/api/MarketsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Markets

> Python SDK methods for Markets operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                    | HTTP request                                                  | Description             |
| --------------------------------------------------------- | ------------------------------------------------------------- | ----------------------- |
| [**get\_market**](#get-market)                            | **GET** /markets/{ticker}                                     | Get Market              |
| [**get\_market\_candlesticks**](#get-market-candlesticks) | **GET** /series/{ticker}/markets/{market_ticker}/candlesticks | Get Market Candlesticks |
| [**get\_market\_orderbook**](#get-market-orderbook)       | **GET** /markets/{ticker}/orderbook                           | Get Market Orderbook    |
| [**get\_markets**](#get-markets)                          | **GET** /markets                                              | Get Markets             |
| [**get\_trades**](#get-trades)                            | **GET** /markets/trades                                       | Get Trades              |

# **get\_market**

> GetMarketResponse get\_market(ticker)

Get Market

Get a single market by its ticker.

A market represents a specific binary outcome within an event that users can trade on (e.g., "Will candidate X win?"). Markets have yes/no positions, current prices, volume, and settlement rules.

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_market_response import GetMarketResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

ticker = 'ticker_example' # str | Market ticker

try:
    # Get Market
    api_response = client.get_market(ticker)
    print("The response of MarketsApi->get_market:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MarketsApi->get_market: %s\n" % e)
```

### Parameters

| Name       | Type    | Description   | Notes |
| ---------- | ------- | ------------- | ----- |
| **ticker** | **str** | Market ticker |       |

### Return type

[**GetMarketResponse**](https://docs.kalshi.com/python-sdk/models/GetMarketResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Market retrieved successfully          |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

# **get\_market\_candlesticks**

> GetMarketCandlesticksResponse get\_market\_candlesticks(ticker, market\_ticker, start\_ts=start\_ts, end\_ts=end\_ts, period\_interval=period\_interval)

Get Market Candlesticks

Get candlestick data for a market within a series

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_market_candlesticks_response import GetMarketCandlesticksResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

ticker = 'ticker_example' # str | The series ticker

market_ticker = 'market_ticker_example' # str | The market ticker

start_ts = 56 # int | Start timestamp for the range (optional)

end_ts = 56 # int | End timestamp for the range (optional)

period_interval = 'period_interval_example' # str | Period interval for candlesticks (e.g., 1m, 5m, 1h, 1d) (optional)

try:
    # Get Market Candlesticks
    api_response = client.get_market_candlesticks(ticker, market_ticker, start_ts=start_ts, end_ts=end_ts, period_interval=period_interval)
    print("The response of MarketsApi->get_market_candlesticks:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MarketsApi->get_market_candlesticks: %s\n" % e)
```

### Parameters

| Name                 | Type    | Description                                             | Notes       |
| -------------------- | ------- | ------------------------------------------------------- | ----------- |
| **ticker**           | **str** | The series ticker                                       |             |
| **market\_ticker**   | **str** | The market ticker                                       |             |
| **start\_ts**        | **int** | Start timestamp for the range                           | \[optional] |
| **end\_ts**          | **int** | End timestamp for the range                             | \[optional] |
| **period\_interval** | **str** | Period interval for candlesticks (e.g., 1m, 5m, 1h, 1d) | \[optional] |

### Return type

[**GetMarketCandlesticksResponse**](https://docs.kalshi.com/python-sdk/models/GetMarketCandlesticksResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Candlesticks retrieved successfully    |
| **400**     | Bad request - invalid input            |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

# **get\_market\_orderbook**

> GetMarketOrderbookResponse get\_market\_orderbook(ticker, depth=depth)

Get Market Orderbook

Get the orderbook for a market

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_market_orderbook_response import GetMarketOrderbookResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

ticker = 'ticker_example' # str | Market ticker

depth = 10 # int | Depth of the orderbook to retrieve (optional) (default to 10)

try:
    # Get Market Orderbook
    api_response = client.get_market_orderbook(ticker, depth=depth)
    print("The response of MarketsApi->get_market_orderbook:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MarketsApi->get_market_orderbook: %s\n" % e)
```

### Parameters

| Name       | Type    | Description                        | Notes                        |
| ---------- | ------- | ---------------------------------- | ---------------------------- |
| **ticker** | **str** | Market ticker                      |                              |
| **depth**  | **int** | Depth of the orderbook to retrieve | \[optional] \[default to 10] |

### Return type

[**GetMarketOrderbookResponse**](https://docs.kalshi.com/python-sdk/models/GetMarketOrderbookResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Orderbook retrieved successfully       |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

# **get\_markets**

> GetMarketsResponse get\_markets(limit=limit, cursor=cursor, event\_ticker=event\_ticker, series\_ticker=series\_ticker, max\_close\_ts=max\_close\_ts, min\_close\_ts=min\_close\_ts, status=status, tickers=tickers)

Get Markets

List and discover markets on Kalshi.

A market represents a specific binary outcome within an event that users can trade on (e.g., "Will candidate X win?"). Markets have yes/no positions, current prices, volume, and settlement rules.

This endpoint returns a paginated response. Use the 'limit' parameter to control page size (1-1000, defaults to 100). The response includes a 'cursor' field - pass this value in the 'cursor' parameter of your next request to get the next page. An empty cursor indicates no more pages are available.

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_markets_response import GetMarketsResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

limit = 100 # int | Number of results per page. Defaults to 100. Maximum value is 1000. (optional) (default to 100)

cursor = 'cursor_example' # str | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. (optional)

event_ticker = 'event_ticker_example' # str | Filter by event ticker (optional)

series_ticker = 'series_ticker_example' # str | Filter by series ticker (optional)

max_close_ts = 56 # int | Filter items that close before this Unix timestamp (optional)

min_close_ts = 56 # int | Filter items that close after this Unix timestamp (optional)

status = 'status_example' # str | Filter by market status. Comma-separated list. Possible values are 'initialized', 'open', 'closed', 'settled', 'determined'. Note that the API accepts 'open' for filtering but returns 'active' in the response. Leave empty to return markets with any status. (optional)

tickers = 'tickers_example' # str | Filter by specific market tickers. Comma-separated list of market tickers to retrieve. (optional)

try:
    # Get Markets
    api_response = client.get_markets(limit=limit, cursor=cursor, event_ticker=event_ticker, series_ticker=series_ticker, max_close_ts=max_close_ts, min_close_ts=min_close_ts, status=status, tickers=tickers)
    print("The response of MarketsApi->get_markets:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MarketsApi->get_markets: %s\n" % e)
```

### Parameters

| Name               | Type    | Description                                                                                                                                                                                                                                                      | Notes                         |
| ------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **limit**          | **int** | Number of results per page. Defaults to 100. Maximum value is 1000.                                                                                                                                                                                              | \[optional] \[default to 100] |
| **cursor**         | **str** | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page.                                                                                                                     | \[optional]                   |
| **event\_ticker**  | **str** | Filter by event ticker                                                                                                                                                                                                                                           | \[optional]                   |
| **series\_ticker** | **str** | Filter by series ticker                                                                                                                                                                                                                                          | \[optional]                   |
| **max\_close\_ts** | **int** | Filter items that close before this Unix timestamp                                                                                                                                                                                                               | \[optional]                   |
| **min\_close\_ts** | **int** | Filter items that close after this Unix timestamp                                                                                                                                                                                                                | \[optional]                   |
| **status**         | **str** | Filter by market status. Comma-separated list. Possible values are 'initialized', 'open', 'closed', 'settled', 'determined'. Note that the API accepts 'open' for filtering but returns 'active' in the response. Leave empty to return markets with any status. | \[optional]                   |
| **tickers**        | **str** | Filter by specific market tickers. Comma-separated list of market tickers to retrieve.                                                                                                                                                                           | \[optional]                   |

### Return type

[**GetMarketsResponse**](https://docs.kalshi.com/python-sdk/models/GetMarketsResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Markets retrieved successfully         |
| **400**     | Bad request - invalid input            |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

# **get\_trades**

> GetTradesResponse get\_trades(limit=limit, cursor=cursor, ticker=ticker, min\_ts=min\_ts, max\_ts=max\_ts)

Get Trades

Get all trades for all markets.

A trade represents a completed transaction between two users on a specific market. Each trade includes the market ticker, price, quantity, and timestamp information.

This endpoint returns a paginated response. Use the 'limit' parameter to control page size (1-1000, defaults to 100). The response includes a 'cursor' field - pass this value in the 'cursor' parameter of your next request to get the next page. An empty cursor indicates no more pages are available.

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_trades_response import GetTradesResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)


# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

limit = 100 # int | Number of results per page. Defaults to 100. Maximum value is 1000. (optional) (default to 100)

cursor = 'cursor_example' # str | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. (optional)

ticker = 'ticker_example' # str | Filter by market ticker (optional)

min_ts = 56 # int | Filter items after this Unix timestamp (optional)

max_ts = 56 # int | Filter items before this Unix timestamp (optional)

try:
    # Get Trades
    api_response = client.get_trades(limit=limit, cursor=cursor, ticker=ticker, min_ts=min_ts, max_ts=max_ts)
    print("The response of MarketsApi->get_trades:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MarketsApi->get_trades: %s\n" % e)
```

### Parameters

| Name        | Type    | Description                                                                                                                                  | Notes                         |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **limit**   | **int** | Number of results per page. Defaults to 100. Maximum value is 1000.                                                                          | \[optional] \[default to 100] |
| **cursor**  | **str** | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | \[optional]                   |
| **ticker**  | **str** | Filter by market ticker                                                                                                                      | \[optional]                   |
| **min\_ts** | **int** | Filter items after this Unix timestamp                                                                                                       | \[optional]                   |
| **max\_ts** | **int** | Filter items before this Unix timestamp                                                                                                      | \[optional]                   |

### Return type

[**GetTradesResponse**](https://docs.kalshi.com/python-sdk/models/GetTradesResponse)

### HTTP response details

| Status code | Description                   |
| ----------- | ----------------------------- |
| **200**     | Trades retrieved successfully |
| **400**     | Bad request - invalid input   |
| **500**     | Internal server error         |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

### /python-sdk/api/MilestonesApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Milestones

> Python SDK methods for Milestones operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                 | HTTP request                       | Description    |
| -------------------------------------- | ---------------------------------- | -------------- |
| [**get\_milestone**](#get-milestone)   | **GET** /milestones/{milestone_id} | Get Milestone  |
| [**get\_milestones**](#get-milestones) | **GET** /milestones                | Get Milestones |

# **get\_milestone**

> GetMilestoneResponse get\_milestone(milestone\_id)

Get Milestone

Get a single milestone by ID

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_milestone_response import GetMilestoneResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

milestone_id = 'milestone_id_example' # str | Milestone ID

try:
    # Get Milestone
    api_response = client.get_milestone(milestone_id)
    print("The response of MilestonesApi->get_milestone:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MilestonesApi->get_milestone: %s\n" % e)
```

### Parameters

| Name              | Type    | Description  | Notes |
| ----------------- | ------- | ------------ | ----- |
| **milestone\_id** | **str** | Milestone ID |       |

### Return type

[**GetMilestoneResponse**](https://docs.kalshi.com/python-sdk/models/GetMilestoneResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Milestone retrieved successfully       |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

# **get\_milestones**

> GetMilestonesResponse get\_milestones(status=status, limit=limit)

Get Milestones

Get all milestones

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_milestones_response import GetMilestonesResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

status = 'status_example' # str | Filter by milestone status (optional)

limit = 100 # int | Number of items per page (minimum 1, maximum 500) (optional) (default to 100)

try:
    # Get Milestones
    api_response = client.get_milestones(status=status, limit=limit)
    print("The response of MilestonesApi->get_milestones:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MilestonesApi->get_milestones: %s\n" % e)
```

### Parameters

| Name       | Type    | Description                                       | Notes                         |
| ---------- | ------- | ------------------------------------------------- | ----------------------------- |
| **status** | **str** | Filter by milestone status                        | \[optional]                   |
| **limit**  | **int** | Number of items per page (minimum 1, maximum 500) | \[optional] \[default to 100] |

### Return type

[**GetMilestonesResponse**](https://docs.kalshi.com/python-sdk/models/GetMilestonesResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Milestones retrieved successfully      |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

### /python-sdk/api/MultivariateCollectionsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MultivariateCollections

> Python SDK methods for MultivariateCollections operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                                                              | HTTP request                                                          | Description                                 |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| [**get\_multivariate\_event\_collection**](#get-multivariate-event-collection)                      | **GET** /multivariate\_event\_collections/{collection_ticker}         | Get Multivariate Event Collection           |
| [**get\_multivariate\_event\_collections**](#get-multivariate-event-collections)                    | **GET** /multivariate\_event\_collections                             | Get Multivariate Event Collections          |
| [**lookup\_multivariate\_event\_collection\_bundle**](#lookup-multivariate-event-collection-bundle) | **POST** /multivariate\_event\_collections/{collection_ticker}/lookup | Lookup Multivariate Event Collection Bundle |

# **get\_multivariate\_event\_collection**

> GetMultivariateEventCollectionResponse get\_multivariate\_event\_collection(collection\_ticker)

Get Multivariate Event Collection

Get a single multivariate event collection by ticker

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_multivariate_event_collection_response import GetMultivariateEventCollectionResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

collection_ticker = 'collection_ticker_example' # str | Collection ticker

try:
    # Get Multivariate Event Collection
    api_response = client.get_multivariate_event_collection(collection_ticker)
    print("The response of MultivariateCollectionsApi->get_multivariate_event_collection:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MultivariateCollectionsApi->get_multivariate_event_collection: %s\n" % e)
```

### Parameters

| Name                   | Type    | Description       | Notes |
| ---------------------- | ------- | ----------------- | ----- |
| **collection\_ticker** | **str** | Collection ticker |       |

### Return type

[**GetMultivariateEventCollectionResponse**](https://docs.kalshi.com/python-sdk/models/GetMultivariateEventCollectionResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Collection retrieved successfully      |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

# **get\_multivariate\_event\_collections**

> GetMultivariateEventCollectionsResponse get\_multivariate\_event\_collections(status=status)

Get Multivariate Event Collections

Get all multivariate event collections

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_multivariate_event_collections_response import GetMultivariateEventCollectionsResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

status = 'status_example' # str | Filter by multivariate collection status (optional)

try:
    # Get Multivariate Event Collections
    api_response = client.get_multivariate_event_collections(status=status)
    print("The response of MultivariateCollectionsApi->get_multivariate_event_collections:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MultivariateCollectionsApi->get_multivariate_event_collections: %s\n" % e)
```

### Parameters

| Name       | Type    | Description                              | Notes       |
| ---------- | ------- | ---------------------------------------- | ----------- |
| **status** | **str** | Filter by multivariate collection status | \[optional] |

### Return type

[**GetMultivariateEventCollectionsResponse**](https://docs.kalshi.com/python-sdk/models/GetMultivariateEventCollectionsResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Collections retrieved successfully     |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

# **lookup\_multivariate\_event\_collection\_bundle**

> LookupBundleResponse lookup\_multivariate\_event\_collection\_bundle(collection\_ticker, lookup\_bundle\_request)

Lookup Multivariate Event Collection Bundle

Lookup a bundle in a multivariate event collection

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.lookup_bundle_request import LookupBundleRequest
from kalshi_python.models.lookup_bundle_response import LookupBundleResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

collection_ticker = 'collection_ticker_example' # str | Collection ticker

lookup_bundle_request = kalshi_python.LookupBundleRequest() # LookupBundleRequest |

try:
    # Lookup Multivariate Event Collection Bundle
    api_response = client.lookup_multivariate_event_collection_bundle(collection_ticker, lookup_bundle_request)
    print("The response of MultivariateCollectionsApi->lookup_multivariate_event_collection_bundle:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling MultivariateCollectionsApi->lookup_multivariate_event_collection_bundle: %s\n" % e)
```

### Parameters

| Name                        | Type                                                                                     | Description       | Notes |
| --------------------------- | ---------------------------------------------------------------------------------------- | ----------------- | ----- |
| **collection\_ticker**      | **str**                                                                                  | Collection ticker |       |
| **lookup\_bundle\_request** | [**LookupBundleRequest**](https://docs.kalshi.com/python-sdk/models/LookupBundleRequest) |                   |       |

### Return type

[**LookupBundleResponse**](https://docs.kalshi.com/python-sdk/models/LookupBundleResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Bundle lookup successful               |
| **400**     | Bad request - invalid input            |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

### /python-sdk/api/PortfolioApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Portfolio

> Python SDK methods for Portfolio operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                                                       | HTTP request                                            | Description                   |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------- |
| [**get\_balance**](#get-balance)                                                             | **GET** /portfolio/balance                              | Get Balance                   |
| [**get\_fills**](#get-fills)                                                                 | **GET** /portfolio/fills                                | Get Fills                     |
| [**get\_portfolio\_resting\_order\_total\_value**](#get-portfolio-resting-order-total-value) | **GET** /portfolio/summary/total\_resting\_order\_value | Get Total Resting Order Value |
| [**get\_positions**](#get-positions)                                                         | **GET** /portfolio/positions                            | Get Positions                 |
| [**get\_settlements**](#get-settlements)                                                     | **GET** /portfolio/settlements                          | Get Settlements               |

# **get\_balance**

> GetBalanceResponse get\_balance()

Get Balance

Endpoint for getting the balance and portfolio value of a member. Both values are returned in cents.

### Parameters

This endpoint does not need any parameter.

### Return type

[**GetBalanceResponse**](https://docs.kalshi.com/python-sdk/models/GetBalanceResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Balance retrieved successfully         |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

# **get\_fills**

> GetFillsResponse get\_fills(ticker=ticker, order\_id=order\_id, min\_ts=min\_ts, max\_ts=max\_ts, limit=limit, cursor=cursor)

Get Fills

Endpoint for getting all fills for the member. A fill is when a trade you have is matched.

### Parameters

| Name          | Type    | Description                                                                                                                                  | Notes                         |
| ------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **ticker**    | **str** | Filter by market ticker                                                                                                                      | \[optional]                   |
| **order\_id** | **str** | Filter by order ID                                                                                                                           | \[optional]                   |
| **min\_ts**   | **int** | Filter items after this Unix timestamp                                                                                                       | \[optional]                   |
| **max\_ts**   | **int** | Filter items before this Unix timestamp                                                                                                      | \[optional]                   |
| **limit**     | **int** | Number of results per page. Defaults to 100. Maximum value is 200.                                                                           | \[optional] \[default to 100] |
| **cursor**    | **str** | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | \[optional]                   |

### Return type

[**GetFillsResponse**](https://docs.kalshi.com/python-sdk/models/GetFillsResponse)

### HTTP response details

| Status code | Description                  |
| ----------- | ---------------------------- |
| **200**     | Fills retrieved successfully |
| **400**     | Bad request                  |
| **401**     | Unauthorized                 |
| **500**     | Internal server error        |

# **get\_portfolio\_resting\_order\_total\_value**

> GetPortfolioRestingOrderTotalValueResponse get\_portfolio\_resting\_order\_total\_value()

Get Total Resting Order Value

Endpoint for getting the total value, in cents, of resting orders. This endpoint is only intended for use by FCM members (rare). Note: If you're uncertain about this endpoint, it likely does not apply to you.

### Parameters

This endpoint does not need any parameter.

### Return type

[**GetPortfolioRestingOrderTotalValueResponse**](https://docs.kalshi.com/python-sdk/models/GetPortfolioRestingOrderTotalValueResponse)

### HTTP response details

| Status code | Description                                      |
| ----------- | ------------------------------------------------ |
| **200**     | Total resting order value retrieved successfully |
| **401**     | Unauthorized - authentication required           |
| **500**     | Internal server error                            |

# **get\_positions**

> GetPositionsResponse get\_positions(cursor=cursor, limit=limit, count\_filter=count\_filter, settlement\_status=settlement\_status, ticker=ticker, event\_ticker=event\_ticker)

Get Positions

Restricts the positions to those with any of following fields with non-zero values, as a comma separated list. The following values are accepted: position, total\_traded

### Parameters

| Name                   | Type    | Description                                                                                                                                                                | Notes                               |
| ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **cursor**             | **str** | The Cursor represents a pointer to the next page of records in the pagination. Use the value returned from the previous response to get the next page.                     | \[optional]                         |
| **limit**              | **int** | Parameter to specify the number of results per page. Defaults to 100.                                                                                                      | \[optional] \[default to 100]       |
| **count\_filter**      | **str** | Restricts the positions to those with any of following fields with non-zero values, as a comma separated list. The following values are accepted - position, total\_traded | \[optional]                         |
| **settlement\_status** | **str** | Settlement status of the markets to return. Defaults to unsettled.                                                                                                         | \[optional] \[default to unsettled] |
| **ticker**             | **str** | Filter by market ticker                                                                                                                                                    | \[optional]                         |
| **event\_ticker**      | **str** | Event ticker of desired positions. Multiple event tickers can be provided as a comma-separated list (maximum 10).                                                          | \[optional]                         |

### Return type

[**GetPositionsResponse**](https://docs.kalshi.com/python-sdk/models/GetPositionsResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Positions retrieved successfully       |
| **400**     | Bad request - invalid input            |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

# **get\_settlements**

> GetSettlementsResponse get\_settlements(limit=limit, cursor=cursor, ticker=ticker, event\_ticker=event\_ticker, min\_ts=min\_ts, max\_ts=max\_ts)

Get Settlements

Endpoint for getting the member's settlements historical track.

### Parameters

| Name              | Type    | Description                                                                                                                                  | Notes                         |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **limit**         | **int** | Number of results per page. Defaults to 100. Maximum value is 200.                                                                           | \[optional] \[default to 100] |
| **cursor**        | **str** | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | \[optional]                   |
| **ticker**        | **str** | Filter by market ticker                                                                                                                      | \[optional]                   |
| **event\_ticker** | **str** | Event ticker of desired positions. Multiple event tickers can be provided as a comma-separated list (maximum 10).                            | \[optional]                   |
| **min\_ts**       | **int** | Filter items after this Unix timestamp                                                                                                       | \[optional]                   |
| **max\_ts**       | **int** | Filter items before this Unix timestamp                                                                                                      | \[optional]                   |

### Return type

[**GetSettlementsResponse**](https://docs.kalshi.com/python-sdk/models/GetSettlementsResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Settlements retrieved successfully     |
| **400**     | Bad request - invalid input            |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

### /python-sdk/api/SeriesApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Series

> Python SDK methods for Series operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                               | HTTP request             | Description          |
| ---------------------------------------------------- | ------------------------ | -------------------- |
| [**get\_series**](#get-series)                       | **GET** /series          | Get Series           |
| [**get\_series\_by\_ticker**](#get-series-by-ticker) | **GET** /series/{ticker} | Get Series by Ticker |

# **get\_series**

> GetSeriesResponse get\_series(status=status)

Get Series

Get all market series

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_series_response import GetSeriesResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

status = 'status_example' # str | Filter by series status (optional)

try:
    # Get Series
    api_response = client.get_series(status=status)
    print("The response of SeriesApi->get_series:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling SeriesApi->get_series: %s\n" % e)
```

### Parameters

| Name       | Type    | Description             | Notes       |
| ---------- | ------- | ----------------------- | ----------- |
| **status** | **str** | Filter by series status | \[optional] |

### Return type

[**GetSeriesResponse**](https://docs.kalshi.com/python-sdk/models/GetSeriesResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Series retrieved successfully          |
| **401**     | Unauthorized - authentication required |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

# **get\_series\_by\_ticker**

> GetSeriesByTickerResponse get\_series\_by\_ticker(ticker)

Get Series by Ticker

Get a single series by its ticker

### Example

```python  theme={null}
import kalshi_python
from kalshi_python.models.get_series_by_ticker_response import GetSeriesByTickerResponse
from kalshi_python.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.elections.kalshi.com/trade-api/v2
# See configuration.py for a list of all supported configuration parameters.
configuration = kalshi_python.Configuration(
    host = "https://api.elections.kalshi.com/trade-api/v2"
)

# Read private key from file
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

# Configure API key authentication
configuration.api_key_id = "your-api-key-id"
configuration.private_key_pem = private_key

# Initialize the Kalshi client
client = kalshi_python.KalshiClient(configuration)

ticker = 'ticker_example' # str | The series ticker

try:
    # Get Series by Ticker
    api_response = client.get_series_by_ticker(ticker)
    print("The response of SeriesApi->get_series_by_ticker:\n")
    pprint(api_response)
except Exception as e:
    print("Exception when calling SeriesApi->get_series_by_ticker: %s\n" % e)
```

### Parameters

| Name       | Type    | Description       | Notes |
| ---------- | ------- | ----------------- | ----- |
| **ticker** | **str** | The series ticker |       |

### Return type

[**GetSeriesByTickerResponse**](https://docs.kalshi.com/python-sdk/models/GetSeriesByTickerResponse)

### HTTP response details

| Status code | Description                            |
| ----------- | -------------------------------------- |
| **200**     | Series retrieved successfully          |
| **401**     | Unauthorized - authentication required |
| **404**     | Resource not found                     |
| **500**     | Internal server error                  |

[\[Back to top\]](#) [\[Back to API list\]](https://docs.kalshi.com/python-sdk/api) [\[Back to Model list\]](https://docs.kalshi.com/python-sdk/models) [\[Back to README\]](https://docs.kalshi.com/python-sdk)

### /python-sdk/api/StructuredTargetsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# StructuredTargets

> Python SDK methods for StructuredTargets operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                  | HTTP request                                        | Description            |
| ------------------------------------------------------- | --------------------------------------------------- | ---------------------- |
| [**get\_structured\_target**](#get-structured-target)   | **GET** /structured\_targets/{structured_target_id} | Get Structured Target  |
| [**get\_structured\_targets**](#get-structured-targets) | **GET** /structured\_targets                        | Get Structured Targets |

# **get\_structured\_target**

> GetStructuredTargetResponse get\_structured\_target(structured\_target\_id)

Get Structured Target

Endpoint for getting data about a specific structured target by its ID.

### Parameters

| Name                       | Type    | Description          | Notes |
| -------------------------- | ------- | -------------------- | ----- |
| **structured\_target\_id** | **str** | Structured target ID |       |

### Return type

[**GetStructuredTargetResponse**](https://docs.kalshi.com/python-sdk/models/GetStructuredTargetResponse)

### HTTP response details

| Status code | Description                              |
| ----------- | ---------------------------------------- |
| **200**     | Structured target retrieved successfully |
| **401**     | Unauthorized                             |
| **404**     | Not found                                |
| **500**     | Internal server error                    |

# **get\_structured\_targets**

> GetStructuredTargetsResponse get\_structured\_targets(type=type, competition=competition, page\_size=page\_size, cursor=cursor)

Get Structured Targets

Page size (min: 1, max: 2000)

### Parameters

| Name            | Type    | Description                                             | Notes                         |
| --------------- | ------- | ------------------------------------------------------- | ----------------------------- |
| **type**        | **str** | Filter by structured target type                        | \[optional]                   |
| **competition** | **str** | Filter by competition                                   | \[optional]                   |
| **page\_size**  | **int** | Number of items per page (min 1, max 2000, default 100) | \[optional] \[default to 100] |
| **cursor**      | **str** | Pagination cursor                                       | \[optional]                   |

### Return type

[**GetStructuredTargetsResponse**](https://docs.kalshi.com/python-sdk/models/GetStructuredTargetsResponse)

### HTTP response details

| Status code | Description                               |
| ----------- | ----------------------------------------- |
| **200**     | Structured targets retrieved successfully |
| **401**     | Unauthorized                              |
| **500**     | Internal server error                     |

### /sdks/python/quickstart.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Python SDK Quick Start

> Get started with the Kalshi Python SDK

## Installation

```bash  theme={null}
pip install kalshi_python_sync
```

Or for async support:

```bash  theme={null}
pip install kalshi_python_async
```

<Note>
  The old `kalshi-python` package is deprecated. Please use `kalshi_python_sync` or `kalshi_python_async` instead.
</Note>

## Quick Start

```python  theme={null}
from kalshi_python_sync import Configuration, KalshiClient

# Configure the client
config = Configuration(
    host="https://api.elections.kalshi.com/trade-api/v2"
)

# For authenticated requests
# Read private key from file
with open("path/to/private_key.pem", "r") as f:
    private_key = f.read()

config.api_key_id = "your-api-key-id"
config.private_key_pem = private_key

# Initialize the client
client = KalshiClient(config)

# Make API calls
balance = client.get_balance()
print(f"Balance: ${balance.balance / 100:.2f}")
```

## Source Code

* PyPI (sync): [https://pypi.org/project/kalshi\_python\_sync/](https://pypi.org/project/kalshi_python_sync/)
* PyPI (async): [https://pypi.org/project/kalshi\_python\_async/](https://pypi.org/project/kalshi_python_async/)

### /sdks/typescript/quickstart.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# TypeScript SDK Quick Start

> Get started with the Kalshi TypeScript SDK

## Installation

```bash  theme={null}
npm install kalshi-typescript
```

## Quick Start

```typescript  theme={null}
import { Configuration, PortfolioApi } from 'kalshi-typescript';

// Configure the SDK
const config = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: 'path/to/your/private-key.pem', // or use privateKeyPem
    basePath: 'https://api.elections.kalshi.com/trade-api/v2'
});

// Create API instance
const portfolioApi = new PortfolioApi(config);

// Make API calls
const balance = await portfolioApi.getBalance();
console.log(`Balance: $${(balance.data.balance || 0) / 100}`);
```

## Authentication

The SDK uses RSA-PSS signing for authentication. You can provide your private key either as a file path or as a PEM string:

```typescript  theme={null}
// Using file path
const config = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: 'path/to/private-key.pem',
    basePath: 'https://api.elections.kalshi.com/trade-api/v2'
});

// Using PEM string
const config = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPem: '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
    basePath: 'https://api.elections.kalshi.com/trade-api/v2'
});
```

## Source Code

* NPM: [kalshi-typescript](https://www.npmjs.com/package/kalshi-typescript)

### /typescript-sdk/api/ApiKeysApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ApiKeys

> TypeScript SDK methods for ApiKeys operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                | HTTP request                    | Description      |
| ------------------------------------- | ------------------------------- | ---------------- |
| [**createApiKey**](#createapikey)     | **POST** /api\_keys             | Create API Key   |
| [**deleteApiKey**](#deleteapikey)     | **DELETE** /api\_keys/{api_key} | Delete API Key   |
| [**generateApiKey**](#generateapikey) | **POST** /api\_keys/generate    | Generate API Key |
| [**getApiKeys**](#getapikeys)         | **GET** /api\_keys              | Get API Keys     |

# **createApiKey**

> CreateApiKeyResponse createApiKey(createApiKeyRequest)

Endpoint for creating a new API key with a user-provided public key.  This endpoint allows users with Premier or Market Maker API usage levels to create API keys by providing their own RSA public key. The platform will use this public key to verify signatures on API requests.

### Parameters

| Name                    | Type                    | Description | Notes |
| ----------------------- | ----------------------- | ----------- | ----- |
| **createApiKeyRequest** | **CreateApiKeyRequest** |             |       |

### Return type

**CreateApiKeyResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: application/json
* **Accept**: application/json

### HTTP response details

| Status code | Description                              | Response headers |
| ----------- | ---------------------------------------- | ---------------- |
| **201**     | API key created successfully             | -                |
| **400**     | Bad request - invalid input              | -                |
| **401**     | Unauthorized                             | -                |
| **403**     | Forbidden - insufficient API usage level | -                |
| **500**     | Internal server error                    | -                |

# **deleteApiKey**

> deleteApiKey()

Endpoint for deleting an existing API key.  This endpoint permanently deletes an API key. Once deleted, the key can no longer be used for authentication. This action cannot be undone.

### Parameters

| Name       | Type          | Description          | Notes                 |
| ---------- | ------------- | -------------------- | --------------------- |
| **apiKey** | \[**string**] | API key ID to delete | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: Not defined

### HTTP response details

| Status code | Description                      | Response headers |
| ----------- | -------------------------------- | ---------------- |
| **204**     | API key successfully deleted     | -                |
| **400**     | Bad request - invalid API key ID | -                |
| **401**     | Unauthorized                     | -                |
| **404**     | API key not found                | -                |
| **500**     | Internal server error            | -                |

# **generateApiKey**

> GenerateApiKeyResponse generateApiKey(generateApiKeyRequest)

Endpoint for generating a new API key with an automatically created key pair.  This endpoint generates both a public and private RSA key pair. The public key is stored on the platform, while the private key is returned to the user and must be stored securely. The private key cannot be retrieved again.

### Parameters

| Name                      | Type                      | Description | Notes |
| ------------------------- | ------------------------- | ----------- | ----- |
| **generateApiKeyRequest** | **GenerateApiKeyRequest** |             |       |

### Return type

**GenerateApiKeyResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: application/json
* **Accept**: application/json

### HTTP response details

| Status code | Description                    | Response headers |
| ----------- | ------------------------------ | ---------------- |
| **201**     | API key generated successfully | -                |
| **400**     | Bad request - invalid input    | -                |
| **401**     | Unauthorized                   | -                |
| **500**     | Internal server error          | -                |

# **getApiKeys**

> GetApiKeysResponse getApiKeys()

Endpoint for retrieving all API keys associated with the authenticated user.  API keys allow programmatic access to the platform without requiring username/password authentication. Each key has a unique identifier and name.

### Parameters

This endpoint does not have any parameters.

### Return type

**GetApiKeysResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     | List of API keys retrieved successfully | -                |
| **401**     | Unauthorized                            | -                |
| **500**     | Internal server error                   | -                |

### /typescript-sdk/api/CommunicationsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Communications

> TypeScript SDK methods for Communications operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                          | HTTP request                                      | Description           |
| ----------------------------------------------- | ------------------------------------------------- | --------------------- |
| [**acceptQuote**](#acceptquote)                 | **PUT** /communications/quotes/{quote_id}/accept  | Accept Quote          |
| [**confirmQuote**](#confirmquote)               | **PUT** /communications/quotes/{quote_id}/confirm | Confirm Quote         |
| [**createQuote**](#createquote)                 | **POST** /communications/quotes                   | Create Quote          |
| [**createRFQ**](#createrfq)                     | **POST** /communications/rfqs                     | Create RFQ            |
| [**deleteQuote**](#deletequote)                 | **DELETE** /communications/quotes/{quote_id}      | Delete Quote          |
| [**deleteRFQ**](#deleterfq)                     | **DELETE** /communications/rfqs/{rfq_id}          | Delete RFQ            |
| [**getCommunicationsID**](#getcommunicationsid) | **GET** /communications/id                        | Get Communications ID |
| [**getQuote**](#getquote)                       | **GET** /communications/quotes/{quote_id}         | Get Quote             |
| [**getQuotes**](#getquotes)                     | **GET** /communications/quotes                    | Get Quotes            |
| [**getRFQ**](#getrfq)                           | **GET** /communications/rfqs/{rfq_id}             | Get RFQ               |
| [**getRFQs**](#getrfqs)                         | **GET** /communications/rfqs                      | Get RFQs              |

# **acceptQuote**

> acceptQuote(acceptQuoteRequest)

Endpoint for accepting a quote. This will require the quoter to confirm

### Parameters

| Name                   | Type                   | Description | Notes                 |
| ---------------------- | ---------------------- | ----------- | --------------------- |
| **acceptQuoteRequest** | **AcceptQuoteRequest** |             |                       |
| **quoteId**            | \[**string**]          | Quote ID    | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: application/json
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **204**     | Quote accepted successfully            | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

# **confirmQuote**

> confirmQuote()

Endpoint for confirming a quote. This will start a timer for order execution

### Parameters

| Name        | Type          | Description | Notes                 |
| ----------- | ------------- | ----------- | --------------------- |
| **body**    | **object**    |             |                       |
| **quoteId** | \[**string**] | Quote ID    | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: application/json
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **204**     | Quote confirmed successfully           | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

# **createQuote**

> CreateQuoteResponse createQuote(createQuoteRequest)

Endpoint for creating a quote in response to an RFQ

### Parameters

| Name                   | Type                   | Description | Notes |
| ---------------------- | ---------------------- | ----------- | ----- |
| **createQuoteRequest** | **CreateQuoteRequest** |             |       |

### Return type

**CreateQuoteResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: application/json
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **201**     | Quote created successfully             | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

# **createRFQ**

> CreateRFQResponse createRFQ(createRFQRequest)

Endpoint for creating a new RFQ. You can have a maximum of 100 open RFQs at a time.

### Parameters

| Name                 | Type                 | Description | Notes |
| -------------------- | -------------------- | ----------- | ----- |
| **createRFQRequest** | **CreateRFQRequest** |             |       |

### Return type

**CreateRFQResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: application/json
* **Accept**: application/json

### HTTP response details

| Status code | Description                                              | Response headers |
| ----------- | -------------------------------------------------------- | ---------------- |
| **201**     | RFQ created successfully                                 | -                |
| **400**     | Bad request - invalid input                              | -                |
| **401**     | Unauthorized - authentication required                   | -                |
| **409**     | Conflict - resource already exists or cannot be modified | -                |
| **500**     | Internal server error                                    | -                |

# **deleteQuote**

> deleteQuote()

Endpoint for deleting a quote, which means it can no longer be accepted.

### Parameters

| Name        | Type          | Description | Notes                 |
| ----------- | ------------- | ----------- | --------------------- |
| **quoteId** | \[**string**] | Quote ID    | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **204**     | Quote deleted successfully             | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

# **deleteRFQ**

> deleteRFQ()

Endpoint for deleting an RFQ by ID

### Parameters

| Name      | Type          | Description | Notes                 |
| --------- | ------------- | ----------- | --------------------- |
| **rfqId** | \[**string**] | RFQ ID      | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **204**     | RFQ deleted successfully               | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

# **getCommunicationsID**

> GetCommunicationsIDResponse getCommunicationsID()

Endpoint for getting the communications ID of the logged-in user.

### Parameters

This endpoint does not have any parameters.

### Return type

**GetCommunicationsIDResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                              | Response headers |
| ----------- | ---------------------------------------- | ---------------- |
| **200**     | Communications ID retrieved successfully | -                |
| **401**     | Unauthorized - authentication required   | -                |
| **500**     | Internal server error                    | -                |

# **getQuote**

> GetQuoteResponse getQuote()

Endpoint for getting a particular quote

### Parameters

| Name        | Type          | Description | Notes                 |
| ----------- | ------------- | ----------- | --------------------- |
| **quoteId** | \[**string**] | Quote ID    | defaults to undefined |

### Return type

**GetQuoteResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Quote retrieved successfully           | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

# **getQuotes**

> GetQuotesResponse getQuotes()

Endpoint for getting quotes

### Parameters

| Name                      | Type          | Description                                                                                                                                  | Notes                            |
| ------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **cursor**                | \[**string**] | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | (optional) defaults to undefined |
| **eventTicker**           | \[**string**] | Event ticker to filter by. Only a single event ticker is supported.                                                                          | (optional) defaults to undefined |
| **marketTicker**          | \[**string**] | Filter by market ticker                                                                                                                      | (optional) defaults to undefined |
| **limit**                 | \[**number**] | Parameter to specify the number of results per page. Defaults to 500.                                                                        | (optional) defaults to 500       |
| **status**                | \[**string**] | Filter quotes by status                                                                                                                      | (optional) defaults to undefined |
| **quoteCreatorUserId**    | \[**string**] | Filter quotes by quote creator user ID                                                                                                       | (optional) defaults to undefined |
| **rfqCreatorUserId**      | \[**string**] | Filter quotes by RFQ creator user ID                                                                                                         | (optional) defaults to undefined |
| **rfqCreatorSubtraderId** | \[**string**] | Filter quotes by RFQ creator subtrader ID (FCM members only)                                                                                 | (optional) defaults to undefined |
| **rfqId**                 | \[**string**] | Filter quotes by RFQ ID                                                                                                                      | (optional) defaults to undefined |

### Return type

**GetQuotesResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Quotes retrieved successfully          | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

# **getRFQ**

> GetRFQResponse getRFQ()

Endpoint for getting a single RFQ by id

### Parameters

| Name      | Type          | Description | Notes                 |
| --------- | ------------- | ----------- | --------------------- |
| **rfqId** | \[**string**] | RFQ ID      | defaults to undefined |

### Return type

**GetRFQResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | RFQ retrieved successfully             | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

# **getRFQs**

> GetRFQsResponse getRFQs()

Endpoint for getting RFQs

### Parameters

| Name              | Type          | Description                                                                                                                                  | Notes                            |
| ----------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **cursor**        | \[**string**] | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | (optional) defaults to undefined |
| **eventTicker**   | \[**string**] | Event ticker to filter by. Only a single event ticker is supported.                                                                          | (optional) defaults to undefined |
| **marketTicker**  | \[**string**] | Filter by market ticker                                                                                                                      | (optional) defaults to undefined |
| **subaccount**    | \[**number**] | Subaccount number (0 for primary, 1-32 for subaccounts). If omitted, defaults to all subaccounts.                                            | (optional) defaults to undefined |
| **limit**         | \[**number**] | Parameter to specify the number of results per page. Defaults to 100.                                                                        | (optional) defaults to 100       |
| **status**        | \[**string**] | Filter RFQs by status                                                                                                                        | (optional) defaults to undefined |
| **creatorUserId** | \[**string**] | Filter RFQs by creator user ID                                                                                                               | (optional) defaults to undefined |

### Return type

**GetRFQsResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | RFQs retrieved successfully            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

### /typescript-sdk/api/EventsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Events

> TypeScript SDK methods for Events operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                    | HTTP request                            | Description        |
| ----------------------------------------- | --------------------------------------- | ------------------ |
| [**getEvent**](#getevent)                 | **GET** /events/{event_ticker}          | Get Event          |
| [**getEventMetadata**](#geteventmetadata) | **GET** /events/{event_ticker}/metadata | Get Event Metadata |
| [**getEvents**](#getevents)               | **GET** /events                         | Get Events         |

# **getEvent**

> GetEventResponse getEvent()

Get data about an event by its ticker.  An event represents a real-world occurrence that can be traded on, such as an election, sports game, or economic indicator release. Events contain one or more markets where users can place trades on different outcomes.

### Example

```typescript  theme={null}
import {
    EventsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new EventsApi(configuration);

let eventTicker: string; //Event ticker (default to undefined)
let withNestedMarkets: boolean; //If true, markets are included within the event object. If false (default), markets are returned as a separate top-level field in the response. (optional) (default to false)

const { status, data } = await apiInstance.getEvent(
    eventTicker,
    withNestedMarkets
);
```

### Parameters

| Name                  | Type           | Description                                                                                                                                    | Notes                        |
| --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **eventTicker**       | \[**string**]  | Event ticker                                                                                                                                   | defaults to undefined        |
| **withNestedMarkets** | \[**boolean**] | If true, markets are included within the event object. If false (default), markets are returned as a separate top-level field in the response. | (optional) defaults to false |

### Return type

**GetEventResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Event retrieved successfully           | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **getEventMetadata**

> GetEventMetadataResponse getEventMetadata()

Get metadata about an event by its ticker

### Example

```typescript  theme={null}
import {
    EventsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new EventsApi(configuration);

let eventTicker: string; //Event ticker (default to undefined)

const { status, data } = await apiInstance.getEventMetadata(
    eventTicker
);
```

### Parameters

| Name            | Type          | Description  | Notes                 |
| --------------- | ------------- | ------------ | --------------------- |
| **eventTicker** | \[**string**] | Event ticker | defaults to undefined |

### Return type

**GetEventMetadataResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Event metadata retrieved successfully  | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **getEvents**

> GetEventsResponse getEvents()

Get data about all events.  An event represents a real-world occurrence that can be traded on, such as an election, sports game, or economic indicator release. Events contain one or more markets where users can place trades on different outcomes.  This endpoint returns a paginated response. Use the 'limit' parameter to control page size (1-200, defaults to 100). The response includes a 'cursor' field - pass this value in the 'cursor' parameter of your next request to get the next page. An empty cursor indicates no more pages are available.

### Example

```typescript  theme={null}
import {
    EventsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new EventsApi(configuration);

let limit: number; //Number of results per page. Defaults to 100. Maximum value is 200. (optional) (default to 100)
let cursor: string; //Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. (optional) (default to undefined)
let withNestedMarkets: boolean; //If true, markets are included within the event object. If false (default), markets are returned as a separate top-level field in the response. (optional) (default to false)
let status: string; //Filter by status. Possible values depend on the endpoint. (optional) (default to undefined)
let seriesTicker: string; //Filter by series ticker (optional) (default to undefined)
let minCloseTs: number; //Filter items that close after this Unix timestamp (optional) (default to undefined)

const { status, data } = await apiInstance.getEvents(
    limit,
    cursor,
    withNestedMarkets,
    status,
    seriesTicker,
    minCloseTs
);
```

### Parameters

| Name                  | Type           | Description                                                                                                                                    | Notes                            |
| --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **limit**             | \[**number**]  | Number of results per page. Defaults to 100. Maximum value is 200.                                                                             | (optional) defaults to 100       |
| **cursor**            | \[**string**]  | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page.   | (optional) defaults to undefined |
| **withNestedMarkets** | \[**boolean**] | If true, markets are included within the event object. If false (default), markets are returned as a separate top-level field in the response. | (optional) defaults to false     |
| **status**            | \[**string**]  | Filter by status. Possible values depend on the endpoint.                                                                                      | (optional) defaults to undefined |
| **seriesTicker**      | \[**string**]  | Filter by series ticker                                                                                                                        | (optional) defaults to undefined |
| **minCloseTs**        | \[**number**]  | Filter items that close after this Unix timestamp                                                                                              | (optional) defaults to undefined |

### Return type

**GetEventsResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Events retrieved successfully          | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

### /typescript-sdk/api/ExchangeApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Exchange

> TypeScript SDK methods for Exchange operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                    | HTTP request                            | Description                |
| --------------------------------------------------------- | --------------------------------------- | -------------------------- |
| [**getExchangeAnnouncements**](#getexchangeannouncements) | **GET** /exchange/announcements         | Get Exchange Announcements |
| [**getExchangeSchedule**](#getexchangeschedule)           | **GET** /exchange/schedule              | Get Exchange Schedule      |
| [**getExchangeStatus**](#getexchangestatus)               | **GET** /exchange/status                | Get Exchange Status        |
| [**getSeriesFeeChanges**](#getseriesfeechanges)           | **GET** /series/fee\_changes            | Get Series Fee Changes     |
| [**getUserDataTimestamp**](#getuserdatatimestamp)         | **GET** /exchange/user\_data\_timestamp | Get User Data Timestamp    |

# **getExchangeAnnouncements**

> GetExchangeAnnouncementsResponse getExchangeAnnouncements()

Endpoint for getting all exchange-wide announcements.

### Parameters

This endpoint does not have any parameters.

### Return type

**GetExchangeAnnouncementsResponse**

### Authorization

No authorization required

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                                   | Response headers |
| ----------- | --------------------------------------------- | ---------------- |
| **200**     | Exchange announcements retrieved successfully | -                |
| **500**     | Internal server error                         | -                |

# **getExchangeSchedule**

> GetExchangeScheduleResponse getExchangeSchedule()

Endpoint for getting the exchange schedule.

### Parameters

This endpoint does not have any parameters.

### Return type

**GetExchangeScheduleResponse**

### Authorization

No authorization required

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                              | Response headers |
| ----------- | ---------------------------------------- | ---------------- |
| **200**     | Exchange schedule retrieved successfully | -                |
| **500**     | Internal server error                    | -                |

# **getExchangeStatus**

> ExchangeStatus getExchangeStatus()

Endpoint for getting the exchange status.

### Parameters

This endpoint does not have any parameters.

### Return type

**ExchangeStatus**

### Authorization

No authorization required

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Exchange status retrieved successfully | -                |
| **500**     | Internal server error                  | -                |
| **503**     | Service unavailable                    | -                |
| **504**     | Gateway timeout                        | -                |

# **getSeriesFeeChanges**

> GetSeriesFeeChangesResponse getSeriesFeeChanges()

### Parameters

| Name               | Type           | Description | Notes                            |
| ------------------ | -------------- | ----------- | -------------------------------- |
| **seriesTicker**   | \[**string**]  |             | (optional) defaults to undefined |
| **showHistorical** | \[**boolean**] |             | (optional) defaults to false     |

### Return type

**GetSeriesFeeChangesResponse**

### Authorization

No authorization required

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                               | Response headers |
| ----------- | ----------------------------------------- | ---------------- |
| **200**     | Series fee changes retrieved successfully | -                |
| **400**     | Bad request - invalid input               | -                |
| **500**     | Internal server error                     | -                |

# **getUserDataTimestamp**

> GetUserDataTimestampResponse getUserDataTimestamp()

There is typically a short delay before exchange events are reflected in the API endpoints. Whenever possible, combine API responses to PUT/POST/DELETE requests with websocket data to obtain the most accurate view of the exchange state. This endpoint provides an approximate indication of when the data from the following endpoints was last validated: GetBalance, GetOrder(s), GetFills, GetPositions

### Parameters

This endpoint does not have any parameters.

### Return type

**GetUserDataTimestampResponse**

### Authorization

No authorization required

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                                | Response headers |
| ----------- | ------------------------------------------ | ---------------- |
| **200**     | User data timestamp retrieved successfully | -                |
| **500**     | Internal server error                      | -                |

### /typescript-sdk/api/MarketsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Markets

> TypeScript SDK methods for Markets operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                              | HTTP request                                                  | Description             |
| --------------------------------------------------- | ------------------------------------------------------------- | ----------------------- |
| [**getMarket**](#getmarket)                         | **GET** /markets/{ticker}                                     | Get Market              |
| [**getMarketCandlesticks**](#getmarketcandlesticks) | **GET** /series/{ticker}/markets/{market_ticker}/candlesticks | Get Market Candlesticks |
| [**getMarketOrderbook**](#getmarketorderbook)       | **GET** /markets/{ticker}/orderbook                           | Get Market Orderbook    |
| [**getMarkets**](#getmarkets)                       | **GET** /markets                                              | Get Markets             |
| [**getTrades**](#gettrades)                         | **GET** /markets/trades                                       | Get Trades              |

# **getMarket**

> GetMarketResponse getMarket()

Get a single market by its ticker.  A market represents a specific binary outcome within an event that users can trade on (e.g., "Will candidate X win?"). Markets have yes/no positions, current prices, volume, and settlement rules.

### Example

```typescript  theme={null}
import {
    MarketsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MarketsApi(configuration);

let ticker: string; //Market ticker (default to undefined)

const { status, data } = await apiInstance.getMarket(
    ticker
);
```

### Parameters

| Name       | Type          | Description   | Notes                 |
| ---------- | ------------- | ------------- | --------------------- |
| **ticker** | \[**string**] | Market ticker | defaults to undefined |

### Return type

**GetMarketResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Market retrieved successfully          | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **getMarketCandlesticks**

> GetMarketCandlesticksResponse getMarketCandlesticks()

Get candlestick data for a market within a series

### Example

```typescript  theme={null}
import {
    MarketsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MarketsApi(configuration);

let ticker: string; //The series ticker (default to undefined)
let marketTicker: string; //The market ticker (default to undefined)
let startTs: number; //Start timestamp for the range (optional) (default to undefined)
let endTs: number; //End timestamp for the range (optional) (default to undefined)
let periodInterval: string; //Period interval for candlesticks (e.g., 1m, 5m, 1h, 1d) (optional) (default to undefined)

const { status, data } = await apiInstance.getMarketCandlesticks(
    ticker,
    marketTicker,
    startTs,
    endTs,
    periodInterval
);
```

### Parameters

| Name               | Type          | Description                                             | Notes                            |
| ------------------ | ------------- | ------------------------------------------------------- | -------------------------------- |
| **ticker**         | \[**string**] | The series ticker                                       | defaults to undefined            |
| **marketTicker**   | \[**string**] | The market ticker                                       | defaults to undefined            |
| **startTs**        | \[**number**] | Start timestamp for the range                           | (optional) defaults to undefined |
| **endTs**          | \[**number**] | End timestamp for the range                             | (optional) defaults to undefined |
| **periodInterval** | \[**string**] | Period interval for candlesticks (e.g., 1m, 5m, 1h, 1d) | (optional) defaults to undefined |

### Return type

**GetMarketCandlesticksResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Candlesticks retrieved successfully    | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **getMarketOrderbook**

> GetMarketOrderbookResponse getMarketOrderbook()

Get the orderbook for a market

### Example

```typescript  theme={null}
import {
    MarketsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MarketsApi(configuration);

let ticker: string; //Market ticker (default to undefined)
let depth: number; //Depth of the orderbook to retrieve (optional) (default to 10)

const { status, data } = await apiInstance.getMarketOrderbook(
    ticker,
    depth
);
```

### Parameters

| Name       | Type          | Description                        | Notes                     |
| ---------- | ------------- | ---------------------------------- | ------------------------- |
| **ticker** | \[**string**] | Market ticker                      | defaults to undefined     |
| **depth**  | \[**number**] | Depth of the orderbook to retrieve | (optional) defaults to 10 |

### Return type

**GetMarketOrderbookResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Orderbook retrieved successfully       | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **getMarkets**

> GetMarketsResponse getMarkets()

List and discover markets on Kalshi.  A market represents a specific binary outcome within an event that users can trade on (e.g., "Will candidate X win?"). Markets have yes/no positions, current prices, volume, and settlement rules.  This endpoint returns a paginated response. Use the 'limit' parameter to control page size (1-1000, defaults to 100). The response includes a 'cursor' field - pass this value in the 'cursor' parameter of your next request to get the next page. An empty cursor indicates no more pages are available.

### Example

```typescript  theme={null}
import {
    MarketsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MarketsApi(configuration);

let limit: number; //Number of results per page. Defaults to 100. Maximum value is 1000. (optional) (default to 100)
let cursor: string; //Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. (optional) (default to undefined)
let eventTicker: string; //Filter by event ticker (optional) (default to undefined)
let seriesTicker: string; //Filter by series ticker (optional) (default to undefined)
let maxCloseTs: number; //Filter items that close before this Unix timestamp (optional) (default to undefined)
let minCloseTs: number; //Filter items that close after this Unix timestamp (optional) (default to undefined)
let status: string; //Filter by market status. Comma-separated list. Possible values are \'initialized\', \'open\', \'closed\', \'settled\', \'determined\'. Note that the API accepts \'open\' for filtering but returns \'active\' in the response. Leave empty to return markets with any status. (optional) (default to undefined)
let tickers: string; //Filter by specific market tickers. Comma-separated list of market tickers to retrieve. (optional) (default to undefined)

const { status, data } = await apiInstance.getMarkets(
    limit,
    cursor,
    eventTicker,
    seriesTicker,
    maxCloseTs,
    minCloseTs,
    status,
    tickers
);
```

### Parameters

| Name             | Type          | Description                                                                                                                                                                                                                                                                                                                            | Notes                            |
| ---------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **limit**        | \[**number**] | Number of results per page. Defaults to 100. Maximum value is 1000.                                                                                                                                                                                                                                                                    | (optional) defaults to 100       |
| **cursor**       | \[**string**] | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page.                                                                                                                                                                                           | (optional) defaults to undefined |
| **eventTicker**  | \[**string**] | Filter by event ticker                                                                                                                                                                                                                                                                                                                 | (optional) defaults to undefined |
| **seriesTicker** | \[**string**] | Filter by series ticker                                                                                                                                                                                                                                                                                                                | (optional) defaults to undefined |
| **maxCloseTs**   | \[**number**] | Filter items that close before this Unix timestamp                                                                                                                                                                                                                                                                                     | (optional) defaults to undefined |
| **minCloseTs**   | \[**number**] | Filter items that close after this Unix timestamp                                                                                                                                                                                                                                                                                      | (optional) defaults to undefined |
| **status**       | \[**string**] | Filter by market status. Comma-separated list. Possible values are \&#39;initialized\&#39;, \&#39;open\&#39;, \&#39;closed\&#39;, \&#39;settled\&#39;, \&#39;determined\&#39;. Note that the API accepts \&#39;open\&#39; for filtering but returns \&#39;active\&#39; in the response. Leave empty to return markets with any status. | (optional) defaults to undefined |
| **tickers**      | \[**string**] | Filter by specific market tickers. Comma-separated list of market tickers to retrieve.                                                                                                                                                                                                                                                 | (optional) defaults to undefined |

### Return type

**GetMarketsResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Markets retrieved successfully         | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **getTrades**

> GetTradesResponse getTrades()

Get all trades for all markets.  A trade represents a completed transaction between two users on a specific market. Each trade includes the market ticker, price, quantity, and timestamp information.  This endpoint returns a paginated response. Use the 'limit' parameter to control page size (1-1000, defaults to 100). The response includes a 'cursor' field - pass this value in the 'cursor' parameter of your next request to get the next page. An empty cursor indicates no more pages are available.

### Example

```typescript  theme={null}
import {
    MarketsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MarketsApi(configuration);

let limit: number; //Number of results per page. Defaults to 100. Maximum value is 1000. (optional) (default to 100)
let cursor: string; //Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. (optional) (default to undefined)
let ticker: string; //Filter by market ticker (optional) (default to undefined)
let minTs: number; //Filter items after this Unix timestamp (optional) (default to undefined)
let maxTs: number; //Filter items before this Unix timestamp (optional) (default to undefined)

const { status, data } = await apiInstance.getTrades(
    limit,
    cursor,
    ticker,
    minTs,
    maxTs
);
```

### Parameters

| Name       | Type          | Description                                                                                                                                  | Notes                            |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **limit**  | \[**number**] | Number of results per page. Defaults to 100. Maximum value is 1000.                                                                          | (optional) defaults to 100       |
| **cursor** | \[**string**] | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | (optional) defaults to undefined |
| **ticker** | \[**string**] | Filter by market ticker                                                                                                                      | (optional) defaults to undefined |
| **minTs**  | \[**number**] | Filter items after this Unix timestamp                                                                                                       | (optional) defaults to undefined |
| **maxTs**  | \[**number**] | Filter items before this Unix timestamp                                                                                                      | (optional) defaults to undefined |

### Return type

**GetTradesResponse**

### Authorization

No authorization required

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     | Trades retrieved successfully | -                |
| **400**     | Bad request - invalid input   | -                |
| **500**     | Internal server error         | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

### /typescript-sdk/api/MilestonesApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Milestones

> TypeScript SDK methods for Milestones operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                              | HTTP request                       | Description    |
| ----------------------------------- | ---------------------------------- | -------------- |
| [**getMilestone**](#getmilestone)   | **GET** /milestones/{milestone_id} | Get Milestone  |
| [**getMilestones**](#getmilestones) | **GET** /milestones                | Get Milestones |

# **getMilestone**

> GetMilestoneResponse getMilestone()

Get a single milestone by ID

### Example

```typescript  theme={null}
import {
    MilestonesApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MilestonesApi(configuration);

let milestoneId: string; //Milestone ID (default to undefined)

const { status, data } = await apiInstance.getMilestone(
    milestoneId
);
```

### Parameters

| Name            | Type          | Description  | Notes                 |
| --------------- | ------------- | ------------ | --------------------- |
| **milestoneId** | \[**string**] | Milestone ID | defaults to undefined |

### Return type

**GetMilestoneResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Milestone retrieved successfully       | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **getMilestones**

> GetMilestonesResponse getMilestones()

Get all milestones

### Example

```typescript  theme={null}
import {
    MilestonesApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MilestonesApi(configuration);

let status: string; //Filter by milestone status (optional) (default to undefined)
let limit: number; //Number of items per page (minimum 1, maximum 500) (optional) (default to 100)

const { status, data } = await apiInstance.getMilestones(
    status,
    limit
);
```

### Parameters

| Name       | Type          | Description                                       | Notes                            |
| ---------- | ------------- | ------------------------------------------------- | -------------------------------- |
| **status** | \[**string**] | Filter by milestone status                        | (optional) defaults to undefined |
| **limit**  | \[**number**] | Number of items per page (minimum 1, maximum 500) | (optional) defaults to 100       |

### Return type

**GetMilestonesResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Milestones retrieved successfully      | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

### /typescript-sdk/api/MultivariateCollectionsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MultivariateCollections

> TypeScript SDK methods for MultivariateCollections operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                                                  | HTTP request                                                          | Description                                 |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| [**getMultivariateEventCollection**](#getmultivariateeventcollection)                   | **GET** /multivariate\_event\_collections/{collection_ticker}         | Get Multivariate Event Collection           |
| [**getMultivariateEventCollections**](#getmultivariateeventcollections)                 | **GET** /multivariate\_event\_collections                             | Get Multivariate Event Collections          |
| [**lookupMultivariateEventCollectionBundle**](#lookupmultivariateeventcollectionbundle) | **POST** /multivariate\_event\_collections/{collection_ticker}/lookup | Lookup Multivariate Event Collection Bundle |

# **getMultivariateEventCollection**

> GetMultivariateEventCollectionResponse getMultivariateEventCollection()

Get a single multivariate event collection by ticker

### Example

```typescript  theme={null}
import {
    MultivariateCollectionsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MultivariateCollectionsApi(configuration);

let collectionTicker: string; //Collection ticker (default to undefined)

const { status, data } = await apiInstance.getMultivariateEventCollection(
    collectionTicker
);
```

### Parameters

| Name                 | Type          | Description       | Notes                 |
| -------------------- | ------------- | ----------------- | --------------------- |
| **collectionTicker** | \[**string**] | Collection ticker | defaults to undefined |

### Return type

**GetMultivariateEventCollectionResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Collection retrieved successfully      | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **getMultivariateEventCollections**

> GetMultivariateEventCollectionsResponse getMultivariateEventCollections()

Get all multivariate event collections

### Example

```typescript  theme={null}
import {
    MultivariateCollectionsApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MultivariateCollectionsApi(configuration);

let status: string; //Filter by multivariate collection status (optional) (default to undefined)

const { status, data } = await apiInstance.getMultivariateEventCollections(
    status
);
```

### Parameters

| Name       | Type          | Description                              | Notes                            |
| ---------- | ------------- | ---------------------------------------- | -------------------------------- |
| **status** | \[**string**] | Filter by multivariate collection status | (optional) defaults to undefined |

### Return type

**GetMultivariateEventCollectionsResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Collections retrieved successfully     | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **lookupMultivariateEventCollectionBundle**

> LookupBundleResponse lookupMultivariateEventCollectionBundle(lookupBundleRequest)

Lookup a bundle in a multivariate event collection

### Example

```typescript  theme={null}
import {
    MultivariateCollectionsApi,
    Configuration,
    LookupBundleRequest
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new MultivariateCollectionsApi(configuration);

let collectionTicker: string; //Collection ticker (default to undefined)
let lookupBundleRequest: LookupBundleRequest; //

const { status, data } = await apiInstance.lookupMultivariateEventCollectionBundle(
    collectionTicker,
    lookupBundleRequest
);
```

### Parameters

| Name                    | Type                    | Description       | Notes                 |
| ----------------------- | ----------------------- | ----------------- | --------------------- |
| **lookupBundleRequest** | **LookupBundleRequest** |                   |                       |
| **collectionTicker**    | \[**string**]           | Collection ticker | defaults to undefined |

### Return type

**LookupBundleResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: application/json
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Bundle lookup successful               | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

### /typescript-sdk/api/PortfolioApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Portfolio

> TypeScript SDK methods for Portfolio operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                                                        | HTTP request                                            | Description                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------- |
| [**applySubaccountTransfer**](#applysubaccounttransfer)                       | **POST** /portfolio/subaccounts/transfer                | Transfer Between Subaccounts  |
| [**createSubaccount**](#createsubaccount)                                     | **POST** /portfolio/subaccounts                         | Create Subaccount             |
| [**getBalance**](#getbalance)                                                 | **GET** /portfolio/balance                              | Get Balance                   |
| [**getFills**](#getfills)                                                     | **GET** /portfolio/fills                                | Get Fills                     |
| [**getPortfolioRestingOrderTotalValue**](#getportfoliorestingordertotalvalue) | **GET** /portfolio/summary/total\_resting\_order\_value | Get Total Resting Order Value |
| [**getPositions**](#getpositions)                                             | **GET** /portfolio/positions                            | Get Positions                 |
| [**getSettlements**](#getsettlements)                                         | **GET** /portfolio/settlements                          | Get Settlements               |
| [**getSubaccountBalances**](#getsubaccountbalances)                           | **GET** /portfolio/subaccounts/balances                 | Get All Subaccount Balances   |
| [**getSubaccountNetting**](#getsubaccountnetting)                             | **GET** /portfolio/subaccounts/netting                  | Get Subaccount Netting        |
| [**getSubaccountTransfers**](#getsubaccounttransfers)                         | **GET** /portfolio/subaccounts/transfers                | Get Subaccount Transfers      |
| [**updateSubaccountNetting**](#updatesubaccountnetting)                       | **PUT** /portfolio/subaccounts/netting                  | Update Subaccount Netting     |

# **applySubaccountTransfer**

> object applySubaccountTransfer(applySubaccountTransferRequest)

Transfers funds between the authenticated user's subaccounts. Use 0 for the primary account, or 1-32 for numbered subaccounts.

### Parameters

| Name                               | Type                               | Description | Notes |
| ---------------------------------- | ---------------------------------- | ----------- | ----- |
| **applySubaccountTransferRequest** | **ApplySubaccountTransferRequest** |             |       |

### Return type

**object**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: application/json
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Transfer completed successfully        | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

# **createSubaccount**

> CreateSubaccountResponse createSubaccount()

Creates a new subaccount for the authenticated user. Subaccounts are numbered sequentially starting from 1. Maximum 32 subaccounts per user.

### Parameters

This endpoint does not have any parameters.

### Return type

**CreateSubaccountResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **201**     | Subaccount created successfully        | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

# **getBalance**

> GetBalanceResponse getBalance()

Endpoint for getting the balance and portfolio value of a member. Both values are returned in cents.

### Parameters

| Name           | Type          | Description                                                             | Notes                            |
| -------------- | ------------- | ----------------------------------------------------------------------- | -------------------------------- |
| **subaccount** | \[**number**] | Subaccount number (0 for primary, 1-32 for subaccounts). Defaults to 0. | (optional) defaults to undefined |

### Return type

**GetBalanceResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Balance retrieved successfully         | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

# **getFills**

> GetFillsResponse getFills()

Endpoint for getting all fills for the member. A fill is when a trade you have is matched. Fills that occurred before the historical cutoff are only available via `GET /historical/fills`. See [Historical Data](https://kalshi.com/docs/getting_started/historical_data) for details.

### Parameters

| Name           | Type          | Description                                                                                                                                  | Notes                            |
| -------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **ticker**     | \[**string**] | Filter by market ticker                                                                                                                      | (optional) defaults to undefined |
| **orderId**    | \[**string**] | Filter by order ID                                                                                                                           | (optional) defaults to undefined |
| **minTs**      | \[**number**] | Filter items after this Unix timestamp                                                                                                       | (optional) defaults to undefined |
| **maxTs**      | \[**number**] | Filter items before this Unix timestamp                                                                                                      | (optional) defaults to undefined |
| **limit**      | \[**number**] | Number of results per page. Defaults to 100. Maximum value is 200.                                                                           | (optional) defaults to 100       |
| **cursor**     | \[**string**] | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | (optional) defaults to undefined |
| **subaccount** | \[**number**] | Subaccount number (0 for primary, 1-32 for subaccounts). If omitted, defaults to all subaccounts.                                            | (optional) defaults to undefined |

### Return type

**GetFillsResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                  | Response headers |
| ----------- | ---------------------------- | ---------------- |
| **200**     | Fills retrieved successfully | -                |
| **400**     | Bad request                  | -                |
| **401**     | Unauthorized                 | -                |
| **500**     | Internal server error        | -                |

# **getPortfolioRestingOrderTotalValue**

> GetPortfolioRestingOrderTotalValueResponse getPortfolioRestingOrderTotalValue()

Endpoint for getting the total value, in cents, of resting orders. This endpoint is only intended for use by FCM members (rare). Note: If you're uncertain about this endpoint, it likely does not apply to you.

### Parameters

This endpoint does not have any parameters.

### Return type

**GetPortfolioRestingOrderTotalValueResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                                      | Response headers |
| ----------- | ------------------------------------------------ | ---------------- |
| **200**     | Total resting order value retrieved successfully | -                |
| **401**     | Unauthorized - authentication required           | -                |
| **500**     | Internal server error                            | -                |

# **getPositions**

> GetPositionsResponse getPositions()

Restricts the positions to those with any of following fields with non-zero values, as a comma separated list. The following values are accepted: position, total\_traded

### Parameters

| Name            | Type          | Description                                                                                                                                                                | Notes                            |
| --------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **cursor**      | \[**string**] | The Cursor represents a pointer to the next page of records in the pagination. Use the value returned from the previous response to get the next page.                     | (optional) defaults to undefined |
| **limit**       | \[**number**] | Parameter to specify the number of results per page. Defaults to 100.                                                                                                      | (optional) defaults to 100       |
| **countFilter** | \[**string**] | Restricts the positions to those with any of following fields with non-zero values, as a comma separated list. The following values are accepted - position, total\_traded | (optional) defaults to undefined |
| **ticker**      | \[**string**] | Filter by market ticker                                                                                                                                                    | (optional) defaults to undefined |
| **eventTicker** | \[**string**] | Event ticker to filter by. Only a single event ticker is supported.                                                                                                        | (optional) defaults to undefined |
| **subaccount**  | \[**number**] | Subaccount number (0 for primary, 1-32 for subaccounts). Defaults to 0.                                                                                                    | (optional) defaults to undefined |

### Return type

**GetPositionsResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Positions retrieved successfully       | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

# **getSettlements**

> GetSettlementsResponse getSettlements()

Endpoint for getting the member's settlements historical track.

### Parameters

| Name            | Type          | Description                                                                                                                                  | Notes                            |
| --------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **limit**       | \[**number**] | Number of results per page. Defaults to 100. Maximum value is 200.                                                                           | (optional) defaults to 100       |
| **cursor**      | \[**string**] | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | (optional) defaults to undefined |
| **ticker**      | \[**string**] | Filter by market ticker                                                                                                                      | (optional) defaults to undefined |
| **eventTicker** | \[**string**] | Event ticker to filter by. Only a single event ticker is supported.                                                                          | (optional) defaults to undefined |
| **minTs**       | \[**number**] | Filter items after this Unix timestamp                                                                                                       | (optional) defaults to undefined |
| **maxTs**       | \[**number**] | Filter items before this Unix timestamp                                                                                                      | (optional) defaults to undefined |
| **subaccount**  | \[**number**] | Subaccount number (0 for primary, 1-32 for subaccounts). If omitted, defaults to all subaccounts.                                            | (optional) defaults to undefined |

### Return type

**GetSettlementsResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Settlements retrieved successfully     | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

# **getSubaccountBalances**

> GetSubaccountBalancesResponse getSubaccountBalances()

Gets balances for all subaccounts including the primary account.

### Parameters

This endpoint does not have any parameters.

### Return type

**GetSubaccountBalancesResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Balances retrieved successfully        | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

# **getSubaccountNetting**

> GetSubaccountNettingResponse getSubaccountNetting()

Gets the netting enabled settings for all subaccounts.

### Parameters

This endpoint does not have any parameters.

### Return type

**GetSubaccountNettingResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                             | Response headers |
| ----------- | --------------------------------------- | ---------------- |
| **200**     | Netting settings retrieved successfully | -                |
| **401**     | Unauthorized - authentication required  | -                |
| **500**     | Internal server error                   | -                |

# **getSubaccountTransfers**

> GetSubaccountTransfersResponse getSubaccountTransfers()

Gets a paginated list of all transfers between subaccounts for the authenticated user.

### Parameters

| Name       | Type          | Description                                                                                                                                  | Notes                            |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **limit**  | \[**number**] | Number of results per page. Defaults to 100. Maximum value is 200.                                                                           | (optional) defaults to 100       |
| **cursor** | \[**string**] | Pagination cursor. Use the cursor value returned from the previous response to get the next page of results. Leave empty for the first page. | (optional) defaults to undefined |

### Return type

**GetSubaccountTransfersResponse**

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Transfers retrieved successfully       | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

# **updateSubaccountNetting**

> updateSubaccountNetting(updateSubaccountNettingRequest)

Updates the netting enabled setting for a specific subaccount. Use 0 for the primary account, or 1-32 for numbered subaccounts.

### Parameters

| Name                               | Type                               | Description | Notes |
| ---------------------------------- | ---------------------------------- | ----------- | ----- |
| **updateSubaccountNettingRequest** | **UpdateSubaccountNettingRequest** |             |       |

### Return type

void (empty response body)

### Authorization

[kalshiAccessSignature](../README.md#kalshiAccessSignature), [kalshiAccessKey](../README.md#kalshiAccessKey), [kalshiAccessTimestamp](../README.md#kalshiAccessTimestamp)

### HTTP request headers

* **Content-Type**: application/json
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Netting setting updated successfully   | -                |
| **400**     | Bad request - invalid input            | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

### /typescript-sdk/api/SeriesApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Series

> TypeScript SDK methods for Series operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                      | HTTP request             | Description          |
| ------------------------------------------- | ------------------------ | -------------------- |
| [**getSeries**](#getseries)                 | **GET** /series          | Get Series           |
| [**getSeriesByTicker**](#getseriesbyticker) | **GET** /series/{ticker} | Get Series by Ticker |

# **getSeries**

> GetSeriesResponse getSeries()

Get all market series

### Example

```typescript  theme={null}
import {
    SeriesApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new SeriesApi(configuration);

let status: string; //Filter by series status (optional) (default to undefined)

const { status, data } = await apiInstance.getSeries(
    status
);
```

### Parameters

| Name       | Type          | Description             | Notes                            |
| ---------- | ------------- | ----------------------- | -------------------------------- |
| **status** | \[**string**] | Filter by series status | (optional) defaults to undefined |

### Return type

**GetSeriesResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Series retrieved successfully          | -                |
| **401**     | Unauthorized - authentication required | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

# **getSeriesByTicker**

> GetSeriesByTickerResponse getSeriesByTicker()

Get a single series by its ticker

### Example

```typescript  theme={null}
import {
    SeriesApi,
    Configuration
} from 'kalshi-typescript';

const configuration = new Configuration({
    apiKey: 'your-api-key-id',
    privateKeyPath: '/path/to/private-key.pem'  // or privateKeyPem: 'PEM string'
});
const apiInstance = new SeriesApi(configuration);

let ticker: string; //The series ticker (default to undefined)

const { status, data } = await apiInstance.getSeriesByTicker(
    ticker
);
```

### Parameters

| Name       | Type          | Description       | Notes                 |
| ---------- | ------------- | ----------------- | --------------------- |
| **ticker** | \[**string**] | The series ticker | defaults to undefined |

### Return type

**GetSeriesByTickerResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                            | Response headers |
| ----------- | -------------------------------------- | ---------------- |
| **200**     | Series retrieved successfully          | -                |
| **401**     | Unauthorized - authentication required | -                |
| **404**     | Resource not found                     | -                |
| **500**     | Internal server error                  | -                |

[\[Back to top\]](#) [\[Back to API list\]](../README.md#documentation-for-api-endpoints) [\[Back to Model list\]](../README.md#documentation-for-models) [\[Back to README\]](../README.md)

### /typescript-sdk/api/StructuredTargetsApi.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# StructuredTargets

> TypeScript SDK methods for StructuredTargets operations

All URIs are relative to *[https://api.elections.kalshi.com/trade-api/v2](https://api.elections.kalshi.com/trade-api/v2)*

| Method                                            | HTTP request                                        | Description            |
| ------------------------------------------------- | --------------------------------------------------- | ---------------------- |
| [**getStructuredTarget**](#getstructuredtarget)   | **GET** /structured\_targets/{structured_target_id} | Get Structured Target  |
| [**getStructuredTargets**](#getstructuredtargets) | **GET** /structured\_targets                        | Get Structured Targets |

# **getStructuredTarget**

> GetStructuredTargetResponse getStructuredTarget()

Endpoint for getting data about a specific structured target by its ID.

### Parameters

| Name                   | Type          | Description          | Notes                 |
| ---------------------- | ------------- | -------------------- | --------------------- |
| **structuredTargetId** | \[**string**] | Structured target ID | defaults to undefined |

### Return type

**GetStructuredTargetResponse**

### Authorization

No authorization required

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                              | Response headers |
| ----------- | ---------------------------------------- | ---------------- |
| **200**     | Structured target retrieved successfully | -                |
| **401**     | Unauthorized                             | -                |
| **404**     | Not found                                | -                |
| **500**     | Internal server error                    | -                |

# **getStructuredTargets**

> GetStructuredTargetsResponse getStructuredTargets()

Page size (min: 1, max: 2000)

### Parameters

| Name            | Type          | Description                                             | Notes                            |
| --------------- | ------------- | ------------------------------------------------------- | -------------------------------- |
| **type**        | \[**string**] | Filter by structured target type                        | (optional) defaults to undefined |
| **competition** | \[**string**] | Filter by competition                                   | (optional) defaults to undefined |
| **pageSize**    | \[**number**] | Number of items per page (min 1, max 2000, default 100) | (optional) defaults to 100       |
| **cursor**      | \[**string**] | Pagination cursor                                       | (optional) defaults to undefined |

### Return type

**GetStructuredTargetsResponse**

### Authorization

No authorization required

### HTTP request headers

* **Content-Type**: Not defined
* **Accept**: application/json

### HTTP response details

| Status code | Description                               | Response headers |
| ----------- | ----------------------------------------- | ---------------- |
| **200**     | Structured targets retrieved successfully | -                |
| **401**     | Unauthorized                              | -                |
| **500**     | Internal server error                     | -                |

### Changelog

+----+---------------------+
| No | Page                |
+----+---------------------+
| 1  | /changelog/index.md |
+----+---------------------+

### /changelog/index.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API Changelog

> Stay updated with API changes and version history

You can subscribe to the RSS changelog at `/changelog/rss.xml` if you'd like to stay ahead of breaking changes.

You can reference the pending API spec under the "version" dropdown menu at the top left. When the actual API is upgraded to this new version, you will see the version marked as "Stable" in the drop-down menu and become the new default on the landing page.

This changelog is a work in progress. As always, we welcome any feedback in our Discord #dev channel!

## Recent Updates

<Update
  label="Mar 3, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Fixed-point migration: deprecation March 12; fractional trading week of March 9",
description: "Legacy integer count and price fields will be removed March 12, 2026. Fractional trading rolls out per-market starting the week of March 9."
}}
>
  * Legacy integer count fields (with `_fp` equivalents) and integer cents price fields (with `_dollars` equivalents) will be removed on **March 12, 2026**
  * Fractional trading will roll out per-market starting the week of **March 9, 2026**; check `fractional_trading_enabled` on Market responses
  * On fractional-enabled markets, legacy integer fields may be truncated; migrate to `_fp` and `_dollars` to avoid data loss

  Docs: [Fixed-Point Migration](/getting_started/fixed_point_migration) and [Fee Rounding](/getting_started/fee_rounding).
</Update>

<Update
  label="Feb 24, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Top-of-book sizes available on Market responses",
description: "Top-of-book sizes available on Market responses"
}}
>
  Market responses now include:

  * `yes_bid_size_fp`: total contract size of orders to buy yes at the best bid price
  * `yes_ask_size_fp`: total contract size of orders to sell yes at the best ask price

  Affected endpoints:

  * `GET /markets`
  * `GET /markets/{ticker}`
</Update>

<Update
  label="Feb 23, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Per-subaccount netting settings",
description: "New endpoints to get and update netting settings per subaccount.",
}}
>
  New endpoints for managing netting settings on individual subaccounts:

  * **`GET /portfolio/subaccounts/netting`**: returns the netting enabled status for all subaccounts
  * **`PUT /portfolio/subaccounts/netting`**: updates the netting enabled status for a specific subaccount (pass `subaccount_number` and `enabled` in the request body)

  Use `subaccount_number=0` for the primary account or `1`–`32` for numbered subaccounts. New subaccounts inherit the primary account's netting setting at creation time.
</Update>

<Update
  label="Feb 21, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Legacy field deprecation on March 5 and fractional trading in demo",
description: "Legacy integer count and price fields will be deprecated on March 5, 2026. Fractional share trading is available for testing in demo.",
}}
>
  Fractional share trading is now available for testing in the demo environment on the following markets:

  * `KXUCL-26-ARS`
  * `KXUCL-26-AJA`

  Legacy fields will be deprecated on `March 5, 2026`:

  * Integer count fields with an `_fp` equivalent will no longer be returned. See [Fixed-Point Contracts](/getting_started/fixed_point_contracts) for migration details.
  * Integer cents price fields (e.g., `yes_bid`, `no_ask`, `last_price`) will no longer be returned. Their `_dollars` equivalents are already available. See [Subpenny Pricing](/getting_started/subpenny_pricing) for details.

  More information will be forthcoming on how fee rounding works with fractional contracts.
</Update>

<Update
  label="Feb 19, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "settlement_value added to market_lifecycle_v2 determined events",
description: "The market_lifecycle_v2 WebSocket channel now includes settlement_value on market determined events"
}}
>
  The `market_lifecycle_v2` WebSocket channel now includes a `settlement_value` field (fixed-point dollar string) on `market_determined` events, indicating the settlement price of the market.

  Expected release date: `February 26, 2026`
</Update>

<Update
  label="Feb 17, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Subaccount filtering on GET /portfolio/balance",
description: "The GET /portfolio/balance endpoint now supports an optional subaccount query parameter to retrieve balance and portfolio value for a specific subaccount."
}}
>
  `GET /portfolio/balance` now accepts an optional `subaccount` query parameter, consistent with other portfolio endpoints (orders, fills, positions, settlements).

  * **Omitted or `subaccount=0`**: returns balance and portfolio value for the primary account (default)
  * **`subaccount=N`**: returns balance and portfolio value for that specific subaccount
</Update>

<Update
  label="Feb 13, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Market liquidity fields deprecated",
description: "Market liquidity fields deprecated"
}}
>
  The `liquidity` and `liquidity_dollars` fields on Market responses are deprecated and will return 0.

  Affected endpoints:

  * `GET /markets`
  * `GET /markets/{ticker}`
  * `GET /events`
  * `GET /events/{ticker}`
  * `GET /events/multivariate`
</Update>

<Update
  label="Feb 16, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Deprecation of non fixed-point fields pushed back",
description: "Fields that have a `_fp` equivalent will continue to be returned via API until at least February 26, 2026.",
}}
>
  The deprecation timeline for non fixed-point count fields has been pushed back.
  Fields that have a `_fp` equivalent will continue to be returned via API until at least `February 26, 2026`.

  See [Fixed-Point Contracts](/getting_started/fixed_point_contracts) for updated migration details.
</Update>

<Update
  label="Feb 19, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Historical data endpoints and cutoff timestamps",
description: "New endpoints for retrieving historical exchange data and cutoff timestamps defining the live/historical boundary"
}}
>
  Kalshi now partitions exchange data into **live** and **historical** tiers. Historical data must be accessed via the new historical API endpoints. The `GET /historical/cutoff` endpoint returns the cutoff timestamps that define this boundary.

  **Cutoff timestamps and what they mean:**

  * `market_settled_ts` — partitioned by **market settlement time**. Markets and their candlesticks that settled before this timestamp are only available via `GET /historical/markets` and `GET /historical/markets/{ticker}/candlesticks`.
  * `trades_created_ts` — partitioned by **trade fill time**. Fills that occurred before this timestamp are only available via `GET /historical/fills`.
  * `orders_updated_ts` — partitioned by **order cancellation or execution time**. Orders canceled or fully executed before this timestamp are only available via `GET /historical/orders`. **Resting (active) orders are unaffected** and always appear in `GET /portfolio/orders`.

  **New endpoints:**

  * `GET /historical/cutoff` — returns the market, trade, and order cutoff timestamps
  * `GET /historical/markets` — settled markets older than the cutoff
  * `GET /historical/markets/{ticker}` — single historical market by ticker
  * `GET /historical/markets/{ticker}/candlesticks` — candlestick data for historical markets
  * `GET /historical/fills` — trade fills older than the cutoff
  * `GET /historical/orders` — canceled/executed orders older than the cutoff

  **Impacted live endpoints:**

  * `GET /markets`, `GET /markets/{ticker}` — settled markets older than `market_settled_ts` will not appear
  * `GET /events` with `with_nested_markets=true` — nested markets older than `market_settled_ts` will not be included
  * `GET /series/{series_ticker}/markets/{ticker}/candlesticks`, `GET /markets/candlesticks` — candlestick data is tied to the market; historical markets' candlesticks must be fetched from `GET /historical/markets/{ticker}/candlesticks`
  * `GET /markets/trades`, `GET /portfolio/fills` — fills older than `trades_created_ts` will not appear
  * `GET /portfolio/orders` — completed/canceled orders older than `orders_updated_ts` will not appear (resting orders are unaffected)
</Update>

<Update
  label="Feb 11, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "CreateOrder no longer offers market type",
description: "CreateOrder no longer offers market as an order type."
}}
>
  `POST /portfolio/orders` removed `type`; `type=market` is no longer offered.
</Update>

<Update
  label="Feb 12, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "MVE events excluded from market_lifecycle_v2 WebSocket channel",
description: "The market_lifecycle_v2 WebSocket channel no longer emits messages for multivariate event (KXMVE-prefixed) tickers."
}}
>
  The `market_lifecycle_v2` WebSocket channel no longer emits lifecycle messages for multivariate event (MVE) markets and events.
  All events and markets with `KXMVE` ticker prefix are now filtered from all lifecycle message types on this channel.

  **Affected channel:**

  * `market_lifecycle_v2`
</Update>

<Update
  label="Feb 12, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "ticker_v2 WebSocket channel removed",
description: "The undocumented ticker_v2 WebSocket channel has been removed from the API."
}}
>
  The `ticker_v2` WebSocket channel has been removed. This was an undocumented experimental channel
  intended as a v2 iteration of the ticker channel but was rolled back due to user feedback.

  Users should continue using the standard `ticker` channel for real-time market updates, which includes
  top-of-book prices, sizes, and last trade information.

  **Removed channel:**

  * `ticker_v2`
</Update>

<Update
  label="Feb 11, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Websocket QoL Improvements",
description: "Websocket QoL Improvements"
}}
>
  * `ticker` channel now provides high precision `time` field.
  * `skip_ticker_ack` subscription-level flag supports skipping market tickers sent in the OK message following a channel update.
</Update>

<Update
  label="Feb 11, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "fractional_trading_enabled added to market response payloads",
description: "Market payloads now include fractional_trading_enabled consistently across endpoints."
}}
>
  Market response payloads now include `fractional_trading_enabled` consistently across event and market data surfaces.

  **Affected endpoints:**

  * `GET /events`
  * `GET /events/{event_ticker}`
  * `GET /markets`
  * `GET /markets/{ticker}`
</Update>

<Update
  label="Feb 5, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "market_id added to Incentive Programs API",
description: "Incentive Programs API responses now include market_id field"
}}
>
  The `GET /incentive_programs` endpoint now returns a `market_id` field containing the market's unique identifier for each incentive program.

  **Affected endpoint:**

  * `GET /incentive_programs`
</Update>

<Update
  label="Feb 3, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "User orders WebSocket channel",
description: "New websocket channel for real-time order created and updated notifications"
}}
>
  Added `user_orders` WebSocket channel to stream real-time order updates (created, updated, canceled, executed)
  for the authenticated user. Supports optional `market_tickers` filter and dynamic
  `update_subscription` commands to add or remove markets.

  **New channel:**

  * `user_orders`
</Update>

<Update
  label="Feb 3, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Order group read endpoints support optional subaccount parameter",
description: "GetOrderGroup and GetOrderGroups now accept an optional subaccount query parameter to filter by subaccount."
}}
>
  `GET /portfolio/order_groups` and `GET /portfolio/order_groups/{order_group_id}` now accept an optional `subaccount` query parameter.
  When provided, results are filtered to that specific subaccount.
  When omitted, results are returned across all subaccounts.

  **Affected endpoints:**

  * `GET /portfolio/order_groups`
  * `GET /portfolio/order_groups/{order_group_id}`
</Update>

<Update
  label="Feb 2, 2026"
  tags={["Upcoming", "New Feature"]}
  rss={{
title: "Subaccount support for RFQs",
description: "CreateRFQ and GetRFQs endpoints now support subaccounts"
}}
>
  The `POST /communications/rfqs` endpoint now accepts an optional `subaccount` parameter to create RFQs on behalf of a subaccount.
  The `GET /communications/rfqs` endpoint now accepts an optional `subaccount` query parameter to filter RFQs by subaccount.

  **Affected endpoints:**

  * `POST /communications/rfqs`
  * `GET /communications/rfqs`
</Update>

<Update
  label="Jan 30, 2026"
  tags={["Upcoming", "New Feature"]}
  rss={{
title: "Order queue position returns fixed point field",
description: "Order queue position returns fixed point field",
}}
>
  Order queue position returns `queue_position_fp` representing the quantity of shares preceeeding the given order.
  Note: the new field is 0-indexed, e.g. the first order in the queue returns `0.00`.

  Affected endpoints:

  * `GET /portfolio/orders/queue_positions`
  * `GET /portfolio/orders/{order_id}/queue_position`
</Update>

<Update
  label="Feb 12, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "L1 orderbook sizes added to ticker WebSocket channel",
description: "The ticker WebSocket channel now includes top-of-book sizes and last trade size, providing a complete L1 orderbook view."
}}
>
  The `ticker` and `margin_ticker` WebSocket channels now include top-of-book sizes and last trade size:

  * `yes_bid_size_fp` / `bid_size_fp` — number of contracts at the best bid price
  * `yes_ask_size_fp` / `ask_size_fp` — number of contracts at the best ask price
  * `last_trade_size_fp` — number of contracts in the most recent trade

  Size changes (even without price changes) now trigger ticker updates. All size fields are fixed-point strings supporting fractional contracts.

  **Affected channels:**

  * `ticker`
  * `margin_ticker`
</Update>

<Update
  label="Jan 29, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Orders return subaccount number",
description: "Order responses now include subaccount_number for direct users."
}}
>
  Order responses now include `subaccount_number` (0 for primary, 1-32 for subaccounts) for direct users.

  **Affected endpoints:**

  * `GET /portfolio/orders`
  * `GET /portfolio/orders/{order_id}`
</Update>

<Update
  label="Jan 29, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Subaccount filter behavior change for orders, fills, and settlements",
description: "When subaccount is omitted, these endpoints now return results across all subaccounts."
}}
>
  The `subaccount` query parameter behavior has been updated for orders, fills, and settlements.
  When `subaccount` is omitted, results are returned across all subaccounts for the authenticated direct member.
  When `subaccount` is provided (including `0` for primary), results are filtered to that specific subaccount.

  **Affected endpoints:**

  * `GET /portfolio/orders`
  * `GET /portfolio/fills`
  * `GET /portfolio/settlements`
</Update>

<Update
  label="Jan 29, 2026"
  tags={["Upcoming", "Breaking Change"]}
  rss={{
title: "Deprecation of non fixed-point fields",
description: "Fields that have a `_fp` equivalent will no longer be returned via API in a future release.",
}}
>
  See [Fixed-Point Contracts](/getting_started/fixed_point_contracts) for updated migration details.
</Update>

<Update
  label="Jan 29, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Fee cost added to fill WebSocket messages",
description: "Fill websocket messages now include fee_cost as a fixed-point dollars string."
}}
>
  Fill WebSocket messages now include `fee_cost` as a fixed-point dollars string.

  **Affected channel:**

  * `fill`
</Update>

<Update
  label="Jan 28, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Subaccount support for cancel, amend, decrease order, and order group operations",
description: "Cancel, amend, and decrease order endpoints now accept an optional subaccount parameter. Order group operations also support subaccounts."
}}
>
  The following endpoints now accept an optional `subaccount` parameter:

  **Order operations:**

  * `DELETE /portfolio/orders/{order_id}` - Cancel order
  * `POST /portfolio/orders/{order_id}/amend` - Amend order
  * `POST /portfolio/orders/{order_id}/decrease` - Decrease order

  **Order group operations:**

  * `POST /portfolio/order_groups` - Create order group
  * `PUT /portfolio/order_groups/{order_group_id}/limit` - Update order group limit
  * `PUT /portfolio/order_groups/{order_group_id}/trigger` - Trigger order group
  * `DELETE /portfolio/order_groups/{order_group_id}` - Delete order group
</Update>

<Update
  label="Jan 28, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Per-order subaccount support in batch cancels",
description: "Batch cancel orders now accepts per-order subaccount values while remaining backwards compatible."
}}
>
  Batch cancel now supports per-order subaccounts while remaining backwards compatible with the existing `ids` payload.

  **Batch cancel:**

  * `POST /portfolio/orders/batched/cancel`
  * New request shape: `orders: [{ order_id, subaccount? }]` (subaccount defaults to `0`)
  * Legacy `ids` array is still accepted and maps to subaccount `0`
</Update>

<Update
  label="Jan 28, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Dollar-denominated target cost for RFQs",
description: "RFQ and Quote endpoints now support target_cost_dollars as a fixed-point dollar string"
}}
>
  Added `target_cost_dollars` (and `rfq_target_cost_dollars` on quotes) as a fixed-point dollar string
  to RFQ and Quote responses. The `CreateRFQ` endpoint now accepts `target_cost_dollars` as an alternative
  to `target_cost_centi_cents`.

  The `target_cost_centi_cents` and `rfq_target_cost_centi_cents` fields are now deprecated.

  **Affected endpoints:**

  * `POST /communications/rfqs`
  * `GET /communications/rfqs`
  * `GET /communications/rfqs/{rfq_id}`
  * `GET /communications/quotes`
  * `GET /communications/quotes/{quote_id}`
</Update>

<Update
  label="Jan 27, 2026"
  tags={["Breaking Change", "Upcoming"]}
  rss={{
title: "Subaccount Balance returns string dollars representation",
description: "Subaccount Balance returns string dollars representation"
}}
>
  The subaccount balance field will be represented as a fixed-point dollars string instead of
  a centicent integer.

  **Affected endpoint:**

  * `GET /portfolio/subaccounts/balances`
</Update>

<Update
  label="Jan 27, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Exchange Fee available on Fills API",
description: "Exchange Fee available on Fills API"
}}
>
  The exhange `fee_cost` will be made available on the Fills API starting `January 28, 2026`.

  **Affected endpoint:**

  * `GET /portfolio/fills`
</Update>

<Update
  label="Jan 26, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "More specific error codes for order validation",
description: "New error codes provide more detailed information about order rejection reasons"
}}
>
  Added more specific error codes for order validation failures. These replace the generic `invalid_order` response in certain cases:

  **New error codes:**

  * `invalid_order_size` - Order quantity is invalid
  * `available_balance_too_low` - Insufficient available balance for the order
  * `order_id_and_client_order_id_mismatch` - OrderID does not match ClOrdID on amend/cancel
  * `order_side_mismatch` - Order side mismatch on amend/cancel
  * `order_ticker_mismatch` - Market ticker mismatch on amend/cancel

  **Affected endpoints:**

  * `POST /portfolio/orders`
  * `POST /portfolio/orders/{order_id}/amend`
  * `DELETE /portfolio/orders/{order_id}`
</Update>

<Update
  label="Jan 22, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Subaccount support for RFQ quotes",
description: "CreateQuote endpoint now accepts a subaccount parameter"
}}
>
  The `POST /communications/quotes` endpoint now accepts an optional `subaccount` parameter to create quotes on behalf of a subaccount.

  **Affected endpoint:**

  * `POST /communications/quotes`
</Update>

<Update
  label="Jan 22, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Get api tier limits endpoint",
description: "New endpoint to retrieve the authorized user's api tier limits"
}}
>
  New endpoint which provides authorized user their api tier and corresponding read and write limits.

  **New endpoint:**

  * `GET /account/limits`

  Release date: `January 28, 2026`
</Update>

<Update
  label="Jan 22, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Order group updates WebSocket channel",
description: "New websocket channel for order group lifecycle updates"
}}
>
  Added `order_group_updates` WebSocket channel to stream order group lifecycle updates
  (created, triggered, reset, deleted, limit\_updated). Payloads include `contracts_limit_fp`
  for created and limit\_updated events.

  **New channel:**

  * `order_group_updates`

  Release date: `January 29, 2026`
</Update>

<Update
  label="Jan 21, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Amend order endpoint: client_order_id fields now optional",
description: "client_order_id and updated_client_order_id are now optional in amend order requests"
}}
>
  The `client_order_id` and `updated_client_order_id` fields in amend order requests are now optional.

  **Behavior changes:**

  * You can now amend orders without providing `client_order_id` fields by using only the `order_id` from the URL path
  * If you provide an `updated_client_order_id`, the order can be found by the exchange and the `client_order_id` updated just on `order_id` alone

  **Affected endpoint:**

  * `POST /trade-api/v2/portfolio/orders/{order_id}/amend`

  **Example:**

  ```json  theme={null}
  {
    "ticker": "MARKET-TICKER",
    "side": "yes",
    "action": "buy",
    "count_fp": "50.00",
    "yes_price": 30
  }
  ```

  This will amend the order identified by `order_id` without requiring `client_order_id` fields.

  Release date: `January 28, 2026`
</Update>

<Update
  label="Jan 29, 2026"
  tags={["Released"]}
  rss={{
title: "Release Jan 29, 2026",
description: "Release Jan 29, 2026"
}}
>
  Release date: `January 29, 2026`
</Update>

<Update
  label="Jan 29, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Order group limit update endpoint",
description: "Update order group contracts limits"
}}
>
  Added an endpoint to update the contracts limit for an order group (rolling 15-second window). If the updated limit would immediately trigger the group, all orders in the group are canceled and the group is triggered.

  **New endpoint:**

  * `PUT /portfolio/order_groups/{order_group_id}/limit`

  **Response updates:**

  * `GET /portfolio/order_groups`
  * `GET /portfolio/order_groups/{order_group_id}`

  Both now include `contracts_limit` and `contracts_limit_fp`.

  Release date: `January 29, 2026`
</Update>

<Update
  label="Jan 22, 2026"
  tags={["Documentation", "Released"]}
  rss={{
title: "WebSocket AsyncAPI fixed-point counts",
description: "Documented *_fp fields for WebSocket payloads in AsyncAPI"
}}
>
  Added `*_fp` fixed-point contract count fields in the WebSocket AsyncAPI spec and examples
  (orderbook, ticker, trades, fills, positions, communications). See the [WebSocket reference](/websockets).

  Release date: `January 22, 2026`
</Update>

<Update
  label="Jan 21, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "GetMarkets Min Updated Ts Filter",
description: "GetMarkets Min Updated Ts Filter"
}}
>
  Added `updated_time` to Market responses and `min_updated_ts` filter to `GET /markets`, which filters for only markets updated later than the provided unix ts.

  Affected endpoints:

  * `GET /markets/{ticker}`
  * `GET /markets`.
</Update>

<Update
  label="Jan 20, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "Get markets may return scalar result",
description: "Get markets may return scalar result"
}}
>
  Currently, a market settled to a scalar result will return `""` in the `market_result` field.
  Starting in the next release, this value will read `"scalar"` instead.

  Affected endpoints:

  * `GET /markets/{ticker}`
  * `GET /markets`

  Release date: `January 28, 2026`
</Update>

<Update
  label="Jan 21, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Manual order group trigger endpoint",
description: "New endpoint to trigger order groups"
}}
>
  Added manual trigger support for order groups.

  **New endpoint:**

  * `PUT /portfolio/order_groups/{order_group_id}/trigger`

  Release date: `January 22, 2026`
</Update>

<Update
  label="Jan 16, 2026"
  tags={["Change", "Upcoming"]}
  rss={{
title: "RFQ maker client order ID format update",
description: "RFQ maker client order ID format update"
}}
>
  Maker RFQ client order IDs now use the format `quote:<hash>:<quote_id>`, where `hash` is an
  8-character hash segment and the maker's quote ID is added as a suffix.

  Release date: `January 22, 2026`
</Update>

<Update
  label="Jan 16, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Candlesticks include_latest_before_start parameter",
description: "New parameter for single market candlestick endpoint to include synthetic initial data point"
}}
>
  Added `include_latest_before_start` parameter to the single market candlesticks endpoint for price continuity.

  When set to `true`, prepends a synthetic candlestick that:

  * Uses the close price from the most recent candlestick before `start_ts`
  * Sets `previous_price` to enable continuous price charting

  **Affected endpoint:**

  * `GET /series/{series_ticker}/markets/{ticker}/candlesticks`

  Release date: `January 22, 2026`
</Update>

<Update
  label="Jan 15, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Fixed-point contract count fields added to REST API",
description: "New _fp string fields for precise contract quantity representation"
}}
>
  Added `*_fp` string fields for contract counts across REST API requests and responses.

  **Example order response:**

  ```json  theme={null}
  {
    "count": 10,
    "count_fp": "10.00",
    "fill_count": 5,
    "fill_count_fp": "5.00"
  }
  ```

  See [Fixed-Point Contracts](/getting_started/fixed_point_contracts) for migration details.

  Release date: `Jan 22, 2026`
</Update>

<Update
  label="Jan 13, 2025"
  tags={["Breaking", "Upcoming"]}
  rss={{
title: "Anonymize RFQ creator IDs when open",
description: "By default RFQ creator IDs will be anonymized while the RFQ is open"
}}
>
  RFQ creator IDs will be exposed only after the RFQ is closed/executes. Accordingly the RFQ creator ID is removed
  entirely from related websocket messages that are created before this point (RFQCreated, QuoteCreated).

  Release date: `Jan 15, 2025`
</Update>

<Update
  label="Jan 13, 2025"
  tags={["Feature", "Upcoming"]}
  rss={{
title: "Yes settlement values in MVE legs",
description: "MVE legs now report settlement value, when known"
}}
>
  Settlement value on component legs are now reported when pulling MVEs.

  Release date: `January 13, 2025`
</Update>

<Update
  label="Jan 12, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Communications WebSocket channel sharding support",
description: "New shard_factor and shard_key parameters for the communications channel"
}}
>
  Added sharding support to the `communications` WebSocket channel for high-throughput RFQ/quote consumers.

  **New subscription parameters:**

  * `shard_factor` (int): Number of shards to divide messages across (e.g., 4)
  * `shard_key` (int): Which shard this connection receives (0 to shard\_factor-1)

  Messages are sharded by `market_ticker` using consistent hashing. Clients can run multiple connections with different `shard_key` values to distribute load while ensuring complete coverage.

  **Validation:**

  * `shard_factor` must be > 0 when provided
  * `shard_key` must be >= 0 and \< `shard_factor`
  * `shard_key` requires `shard_factor` to be set

  **Example subscription:**

  ```json  theme={null}
  {
    "id": 1,
    "cmd": "subscribe",
    "params": {
      "channels": ["communications"],
      "shard_factor": 4,
      "shard_key": 0
    }
  }
  ```

  **No breaking changes:** When these parameters are omitted, all messages are received as before. Existing integrations are unaffected.
</Update>

<Update
  label="Jan 9, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Subaccount API endpoints",
description: "New endpoints for managing subaccounts and transferring funds between them"
}}
>
  New endpoints for managing subaccounts within a user's portfolio.

  **New endpoints:**

  * `POST /portfolio/subaccounts` - Create a new subaccount
  * `GET /portfolio/subaccounts/balances` - Get balances for all subaccounts
  * `POST /portfolio/subaccounts/transfer` - Transfer funds between subaccounts
  * `GET /portfolio/subaccounts/transfers` - Get paginated history of subaccount transfers

  **Note:** Transfers require a unique `client_transfer_id` for idempotency.
</Update>

<Update
  label="Jan 9, 2025"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "New market response field Is Provisional",
description: "New market response field Is Provisional"
}}
>
  On `GET /markets`, responses may bear `is_provisional: true`, indicating that the market will be removed
  from the API if it has no activity by settlement time.

  Notes:

  * Historical and existing markets are unaffected, this change only applies going forward.
  * A market will never transition into the provisional state if it was not created as provisional.

  Expected release date: `January 9, 2025`.
</Update>

<Update
  label="Jan 6, 2026"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Series volume field added to Series API",
description: "Optional volume field added to Series responses"
}}
>
  Added optional `volume` field to Series responses showing total contracts traded across all events in the series.

  **Affected endpoints:**

  * `GET /series` - Added `include_volume` query parameter (default: `false`)
  * `GET /series/{series_ticker}` - Added `include_volume` query parameter (default: `false`)

  When `include_volume=true`, the response includes the `volume` field with the total contracts traded.

  Release date: `January 15, 2026`
</Update>

<Update
  label="Jan 6, 2026"
  tags={["Breaking Change", "Upcoming"]}
  rss={{
title: "Cent-denominated price fields removed from Market responses",
description: "Cent-denominated price fields removed from Market responses"
}}
>
  Cent-denominated price fields will be removed from Market responses.

  Affected endpoints:

  * `GET /markets`
  * `GET /markets/{ticker}`
  * `GET /events`
  * `GET /events/{ticker}`

  Fields to be removed:

  * `response_price_units`, `notional_value`, `yes_bid`, `yes_ask`, `no_bid`, `no_ask`, `last_price`, `previous_yes_bid`, `previous_yes_ask`, `previous_price`, `liquidity` → Use `*_dollars` equivalents (e.g., `yes_bid_dollars`)
  * `tick_size` → Use `price_level_structure` and `price_ranges`

  Release date: `January 15, 2026`
</Update>

<Update
  label="Jan 5, 2026"
  tags={["Breaking Change", "Upcoming"]}
  rss={{
title: "Deprecated Market fields removed: category and risk_limit_cents",
description: "Deprecated fields category and risk_limit_cents removed from Market responses"
}}
>
  The deprecated fields `category` and `risk_limit_cents` will be removed from Market responses.

  **Affected endpoints:**

  * `GET /markets`
  * `GET /markets/{ticker}`

  Release date: `January 8, 2026`
</Update>

<Update
  label="Dec 22, 2025"
  tags={["Bug Fix", "Released"]}
  rss={{
title: "Lowercase query parameters support for search",
description: "Search endpoints now support lowercase query parameters"
}}
>
  Search endpoints now accept lowercase query parameters for improved flexibility and consistency.

  Release date: `December 22, 2025`
</Update>

<Update
  label="Dec 19, 2025"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Settlement timestamp added to Markets API",
description: "Settlement timestamp added to Markets API"
}}
>
  Added `settlement_ts` field to `GET /markets` and `GET /markets/{ticker}` responses.

  Release date: `December 25, 2025`
</Update>

<Update
  label="Dec 16, 2025"
  tags={["Documentation", "Released"]}
  rss={{
title: "Market Status Values",
description: "Documented all possible market status values in response"
}}
>
  The `Market` response object now documents all possible `status` values: `initialized`, `inactive`, `active`, `closed`, `determined`, `disputed`, `amended`, `finalized`.
</Update>

<Update
  label="Dec 13, 2025"
  tags={["Upcoming"]}
  rss={{
title: "Paused filter added to Get Markets",
description: "Paused filter added to Get Markets",
}}
>
  In `GET /markets`, markets that have been paused by an administrator will be available under new the `paused` status filter.
</Update>

<Update
  label="Dec 11, 2025"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Event ticker available in Settlements API",
description: "Event ticker available in Settlements API"
}}
>
  `GET /portfolio/settlements` will return each settled position's Event Ticker.
  Release Date: `December 18, 2025`
</Update>

<Update
  label="Dec 18, 2025"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Read-Only API Keys",
description: "API keys now support scopes for read-only or full access permissions"
}}
>
  API keys now support a `scopes` field. Valid scopes are `read` and `write`. Keys default to full access if not specified. All existing API keys will have both scopes.

  Release date: `December 18, 2025`
</Update>

<Update
  label="Dec 5, 2025"
  tags={["Breaking Change", "Upcoming"]}
  rss={{
title: "GET /portfolio/positions no longer supports settled positions",
description: "GET /portfolio/positions no longer supports settled positions",
}}
>
  `GET /portfolio/positions` will only return unsettled positions. For fetching settled market positions, switch to `GET /portfolio/settlements`.

  Release date: December 11, 2025
</Update>

<Update
  label="Dec 2, 2025"
  tags={["Breaking Change", "Upcoming"]}
  rss={{
title: "GET /events no longer returns multivariate events",
description: "GET /events now excludes all multivariate events. Use GET /events/multivariate for MVE events.",
}}
>
  Breaking Change: `GET /events` excludes multivariate events

  Release date: December 4, 2025
</Update>

<Update
  label="Dec 1, 2025"
  tags={["Upcoming"]}
  rss={{
title: "SDK Updates and kalshi_python renamed to kalshi_python_sync",
description: "New SDK versions will be released by Thursday. SDK versions will track openapi spec versions. Kalshi will be publishing sync and async python clients as well as updating the existing typescript client."
}}
>
  Release date: `December 4, 2025`
</Update>

<Update
  label="Dec 1, 2025"
  tags={["Upcoming"]}
  rss={{
title: "General availability for Batch Cancel Orders API",
description: "General availability for Batch Cancel Orders API"
}}
>
  `DELETE /portfolio/orders/batched` is now generally available. Advanced API access is no longer required. (The Nov 14th update only applied to `POST`.)

  Release date: `December 4, 2025`
</Update>

<Update
  label="Nov 29, 2025"
  tags={["Upcoming"]}
  rss={{
title: "Live Data Response Includes Milestone ID",
description: "Live Data Response Includes Milestone ID"
}}
>
  `GET /live_data/{type}/milestone/{milestone_id}` and `GET /live_data/batch` now returns `milestone_id` in the response.

  Release date: `December 4, 2025`
</Update>

<Update
  label="Nov 23, 2025"
  tags={["Upcoming"]}
  rss={{
title: "Get Markets Filter Updates",
description: "Get Markets Filter Updates"
}}
>
  Updates to filtering in `GET /markets`

  * Inactive markets during tradable hours will returned in the `open` selector.
  * Inactive markets during tradable hours no longer appear in the `closed` selector.
  * Restricting to a single status filter allowed per request (previously announced).

  Release date: `November 27, 2025`
</Update>

<Update
  label="Nov 21, 2025"
  tags={["Upcoming"]}
  rss={{
title: "Subpenny bids added to Get Quote API",
description: "Subpenny bids added to Get Quote API"
}}
>
  Subpenny fields `yes_bid_dollars` and `no_bid_dollars` available on the Get Quote API. Affected endpoints:

  * `GET /communications/quotes`
  * `GET /communications/quotes/{quote_id}`
</Update>

<Update
  label="Nov 27, 2025"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Batch Market Candlesticks endpoint",
description: "New endpoint for retrieving candlestick data for multiple markets in a single request"
}}
>
  Adds new endpoint `GET /markets/candlesticks`

  Retrieve candlestick data for multiple markets in a single API call. Supports up to 10,000 candlesticks total across all requested markets.

  Expected release: `November 27, 2025`
</Update>

<Update
  label="Nov 21, 2025"
  tags={["Breaking Change", "Upcoming"]}
  rss={{
title: "Order expiration and IoC behavior changes",
description: "Orders with past expiration timestamps will be rejected instead of coerced to IoC. IoC flag can no longer be combined with expiration_ts."
}}
>
  **Breaking changes to order expiration and immediate-or-cancel (IoC) handling:**

  1. **Past expiration timestamps now rejected**: Orders with `expiration_ts` in the past will be rejected with error "Expiration timestamp must be in the future" instead of being automatically converted to IoC orders.

  2. **IoC + expiration\_ts combination rejected**: Orders cannot specify both `time_in_force: "immediate_or_cancel"` and `expiration_ts`. This will be rejected at the API level with error "Cannot specify both immediate\_or\_cancel and expiration\_ts".

  3. **IoC orders no longer support expiration**: The IoC order type is now independent and does not accept an expiration timestamp.

  **Migration guide**: If you were previously using past `expiration_ts` values to indicate IoC behavior, you must now explicitly set `time_in_force: "immediate_or_cancel"` instead.

  Expected release: `TBD`
</Update>

<Update
  label="Nov 20, 2025"
  tags={["Upcoming"]}
  rss={{
title: "Removing pending from status enum",
description: "'Pending' is being removed from the status enum on orders"
}}
>
  'Pending' is being removed from the status enum on orders

  Expected release: `November 27, 2025`
</Update>

<Update
  label="Nov 14, 2025"
  tags={["Upcoming"]}
  rss={{
title: "General availability for Batch Create Orders API",
description: "General availability for Batch Create Orders API"
}}
>
  `POST /portfolio/orders/batched` will now be generally available. Advanced API access is no longer a prerequisite.

  Release date: `November 20, 2025`
</Update>

<Update
  label="Nov 14, 2025"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "New timestamp filters for Markets API",
description: "New timestamp filters for Markets API"
}}
>
  Added `created_time` to `GET /markets` && `GET /market` responses.

  Release date: `November 20, 2025`
</Update>

<Update
  label="Nov 11, 2025"
  tags={["Breaking Change", "Released"]}
  rss={{
title: "Restrictions to GetMarkets Filters",
description: "Restrictions to GetMarkets Filters"
}}
>
  Breaking changes planned to `GET /markets` endpoint for performance reasons:
  Timestamp filters will be mutually exclusive from other timestamp filters and certain status filters.

  | Compatible Timestamp Filters       | Additional Status Filters   |
  | ---------------------------------- | --------------------------- |
  | min\_created\_ts, max\_created\_ts | `unopened`, `open`, *empty* |
  | min\_close\_ts, max\_close\_ts     | `closed`, *empty*           |
  | min\_settled\_ts, max\_settled\_ts | `settled`, *empty*          |
</Update>

<Update
  label="Nov 11, 2025"
  tags={["New Feature", "Released"]}
  rss={{
title: "New timestamp filters for Markets API",
description: "New timestamp filters for Markets API"
}}
>
  Added new timestamp filters for the `GET /markets` endpoint:

  * `min_created_ts`
  * `max_created_ts`
  * `min_settled_ts`
  * `max_settled_ts`
</Update>

<Update
  label="Nov 7, 2025"
  tags={["Breaking Change", "Upcoming"]}
  rss={{
title: "Resting market positions filter removed",
description: "Resting market positions filter removed"
}}
>
  * `GET /portfolio/positions` will no longer return `resting_orders_count` in both the `event_positions` and `market_positions` field.
  * The `resting_order_count` filter on `GET /portfolio/positions` will no longer be supported. Requests specifying this filter will return a 400 error.

  Expected release: `November 13, 2025`
</Update>

<Update
  label="Nov 13, 2025"
  tags={["Upcoming"]}
  rss={{
title: "Settlements API returns fee cost",
description: "Settlements API returns fee cost"
}}
>
  `GET /portfolio/settlements` now returns the sum of trade fees paid by the user on a settled market position.
</Update>

<Update
  label="Nov 6, 2025"
  tags={["Bug Fix", "Upcoming"]}
  rss={{
title: "GetEvents limit parameter now defaults to 200 and respects the parameter.",
description: "Fixed GetEvents limit parameter."
}}
>
  Fixed two issues with the `GET /events` endpoint's `limit` parameter:

  * **Default increased**: The default limit is now 200 (previously 100) to return more results per page
  * **Parameter**: Requests with `with_nested_markets=true` now properly respect `limit=200` instead of being capped at 100
</Update>

<Update
  label="Nov 6, 2025"
  tags={["Upcoming"]}
  rss={{
title: "Portfolio positions now include total_cost_shares",
description: "Added total_cost_shares field to portfolio/positions endpoint showing total shares traded per event."
}}
>
  The `GET /portfolio/positions` endpoint now includes `total_cost_shares`, which tracks the total number of shares traded on an event (including both YES and NO contracts).
</Update>

<Update
  label="Nov 6, 2025"
  tags={["New Feature", "Upcoming"]}
  rss={{
title: "Multivariate Events API and Enhanced Market Filtering",
description: "New endpoint for multivariate events and enhanced market filtering capabilities"
}}
>
  Added comprehensive support for multivariate events (combos) with new API endpoints and enhanced filtering:

  **New Endpoint and deprecation of multivariate events in GetEvents endpoint**

  * `GET /events/multivariate` - Retrieve multivariate events with filtering by series and collection ticker.
  * `GET /events` will EXCLUDE multivariate events upon the next release (November 13th). Please use the new endpoint!

  **Enhanced Market Filtering:**

  * `GET /markets` now supports `mve_filter` parameter:
    * `"only"` - Returns only multivariate events
    * `"exclude"` - Excludes multivariate events
    * No parameter - Returns all events (default behavior)

  Expected release: `November 6th, 2025`
</Update>

<Update
  label="Oct 24, 2025"
  tags={["Bug Fix", "Upcoming"]}
  rss={{
title: "Batch order creation now returns post-only cross errors",
description: "Post-only orders that cross the market in batch requests now return detailed error messages instead of just status canceled."
}}
>
  Fixed batch order creation to return proper error details when post-only orders cross the market. The response now includes:

  * Error code: `"invalid order"`
  * Error details: `"post only cross"`

  This makes the batch endpoint consistent with single order creation and provides clear feedback on why post-only orders were rejected.
</Update>

<Update
  label="Oct 20, 2025"
  tags={["Released"]}
  rss={{
title: "Get Orders endpoint supports multiple event tickers",
description: "The event_ticker parameter now accepts comma-separated values to filter orders across multiple events."
}}
>
  The `GET /portfolio/orders` endpoint's `event_ticker` parameter now supports filtering by multiple events using comma-separated values.

  **Example usage:**

  ```
  GET /portfolio/orders?event_ticker=EVENT1,EVENT2,EVENT3
  ```

  **Backward Compatible:**

  * Single event ticker queries continue to work as before
  * Multiple event tickers return orders from all specified events
</Update>

<Update
  label="Oct 19, 2025"
  tags={["Bug Fix", "Released"]}
  rss={{
title: "Added missing fields to Quote responses",
description: "Restored rfq_target_cost_centi_cents, rfq_creator_order_id, and creator_order_id fields to Quote API responses"
}}
>
  Fixed missing fields in Quote responses: `rfq_target_cost_centi_cents`, `rfq_creator_order_id`, and `creator_order_id` are now properly included in all Quote-related endpoints.
</Update>

<Update
  label="Oct 16, 2025"
  tags={["Released"]}
  rss={{
title: "'with_milestones' flag on Events API",
description: "Adds an optional flag to request milestone data along with events."
}}
>
  The `GET /events` endpoint now supports an optional flag, `with_milestones`, that includes all milestones related to the returned events.

  Expected release: `October 16, 2025`
</Update>

<Update
  label="Oct 14, 2025"
  tags={["Released"]}
  rss={{
title: "Create Order Response Updated",
description: "Create Order now returns the full Order model"
}}
>
  The order returned by create order is now the same model as the model returned by get order.
</Update>

<Update
  label="Oct 13, 2025"
  tags={["Released"]}
  rss={{
title: "Incentive Programs API includes series_ticker",
description: "Incentive Programs API responses now include series_ticker field"
}}
>
  The `GET /v2/incentive_programs` and `GET /incentive_programs` endpoints now return a `series_ticker` field for each incentive program.

  Expected release: `October 13, 2025`
</Update>

<Update
  label="Oct 10, 2025"
  tags={["Breaking Change", "Released"]}
  rss={{
title: "Price level structure moved from event to market level",
description: "Price level structure moved from event to market level"
}}
>
  The `price_level_structure` field has been moved from the event level to the market level. Each market now has its own `price_level_structure` field.

  **Affected endpoints:**

  * `GET /trade-api/v2/events`
  * `GET /trade-api/v2/events/:event_ticker`
  * `GET /trade-api/v2/markets`
  * `GET /trade-api/v2/markets/:ticker`

  **Note:** The `price_level_structure` field on event objects is now deprecated and will be removed. Please use the field on individual market objects instead.

  Expected release date: `Oct 15th, 2025`
</Update>

<Update
  label="Oct 13, 2025"
  tags={["Bug Fix", "Breaking Change", "Released"]}
  rss={{
title: "Fixed series tag filtering to support tags with spaces",
description: "Series tags parameter now only uses comma separation, allowing tags with spaces like 'Rotten Tomatoes' to work correctly"
}}
>
  Fixed the `GET /series` endpoint's tags parameter to properly support tags containing spaces. Previously, the parameter would split on both commas AND spaces, breaking searches for tags like "Rotten Tomatoes".

  **Breaking Change:**

  * The `tags` query parameter now **only** splits on commas (`,`), not spaces
  * Tags with spaces (e.g., "Rotten Tomatoes") now work correctly
  * Multiple tags must be comma-separated: `?tags=Rotten Tomatoes,Television`

  **Before (broken):**

  ```
  GET /series?tags=Rotten Tomatoes
  // Was incorrectly parsed as: ["Rotten", "Tomatoes"]
  // Result: No matches found
  ```

  **After (fixed):**

  ```
  GET /series?tags=Rotten Tomatoes
  // Correctly parsed as: ["Rotten Tomatoes"]
  // Result: Returns series with the "Rotten Tomatoes" tag

  GET /series?tags=Rotten Tomatoes,Television
  // Correctly parsed as: ["Rotten Tomatoes", "Television"]
  // Result: Returns series with either tag
  ```

  This change may affect integrations that relied on space-separated tags. Please update to use comma-separated tags only.
</Update>

<Update
  label="Oct 8, 2025"
  tags={["Bug Fix", "Released"]}
  rss={{
title: "Fixed trailing slash redirects on collection endpoints",
description: "Fixed inconsistent 301 redirects on collection endpoints - requests without trailing slashes now return 200 directly"
}}
>
  Fixed routing inconsistency where certain collection endpoints required trailing slashes, causing unnecessary 301 redirects for requests without them.

  **Endpoints now returning 200 for requests without trailing slash** (previously returned 301):

  * `GET /milestones`
  * `GET /structured_targets`
  * `GET /multivariate_event_collections`
  * `GET /series`
  * `GET /api_keys`
  * `POST /api_keys`

  **Note:** Requests with trailing slashes (e.g., `/milestones/`) will now receive a 301 redirect to the version without the trailing slash, which is the opposite of the previous behavior.
</Update>

<Update
  label="Oct 9, 2025"
  tags={["Released"]}
  rss={{
title: "Missing subpenny fields in Orders and Trades",
description: "Missing subpenny fields in Orders and Trades"
}}
>
  Subpenny fields have been added to orders (`taker_fees_dollars`, `maker_fees_dollars`), as well as to public trades (`yes_price_dollars`, `no_price_dollars`).

  Endpoints affected:

  * `GET /trade-api/v2/portfolio/orders`
  * `GET /trade-api/v2/markets/trades`
</Update>

<Update
  label="Oct 9, 2025"
  tags={["Released"]}
  rss={{
title: "Subpenny support in WS for RFQs and Quotes",
description: "Subpenny support in WS for RFQs and Quotes"
}}
>
  Fields have been added to all RFQ and quote messages to support subpenny pricing via the dollar normalized price fields.
  For more info reference:

  * [Subpenny Pricing](/getting_started/subpenny_pricing)
  * [Websocket Documentation](/websockets)
</Update>

<Update
  label="Oct 7, 2025"
  tags={["Released"]}
  rss={{
title: "Enhanced Portfolio Balance Endpoint",
description: "Added portfolio_value field to GET /portfolio/balance endpoint"
}}
>
  Enhanced the existing `GET /portfolio/balance` endpoint to include a `portfolio_value` field that provides the total portfolio value (available balance plus current market value of all positions), both in cents.
</Update>

<Update
  label="Oct 1, 2025"
  tags={["Released"]}
  rss={{
title: "Series Fee Changes API returns user-facing fee type names",
description: "Series Fee Changes API and notifications now return user-facing fee type names"
}}
>
  The `GET /series/fee_changes` endpoint now returns user-facing fee type names (`quadratic`, `quadratic_with_maker_fees`, `flat`) instead of internal fee structure names. This change also applies to CustomerIO notifications for scheduled series fee updates.

  Expected release: `October 1, 2025`
</Update>

<Update
  label="Sep 25, 2025"
  tags={["Released"]}
  rss={{
title: "Websocket subscribe idempotent",
description: "Websocket subscribe idempotent"
}}
>
  Repeated subscriptions on the same websocket call will no longer error. If passing
  the same market tickers as before, no action will be taken. If passing new market tickers,
  they will be added to your existing subscription.

  Additionally, the user may supply WS Command `list_subscriptions` to view their existing subscriptions.

  Expected release: `October 1, 2025`
</Update>

<Update
  label="Sep 25, 2025"
  tags={["Released"]}
  rss={{
title: "FoK orders that self-cross treated as IoC",
description: "FoK orders that self-cross treated as IoC."
}}
>
  For optimization purposes, partial fills generated by self-crossing FoK orders are not rolled back.
  If a FoK order self-crosses, order execution proceeds based on `self_trade_prevention_type`:

  * `taker_at_cross`: the taker is canceled, execution stops. Any partial fills are executed.
  * `maker`: the maker is canceled, execution continues. After execution, remaining taker quantity is canceled.
    Any fills are executed.

  This fixes a bug where partially filled FoK orders with Maker STP entered into the book after self-crossing.
  Expected enforced date: `Oct 1, 2025`.
</Update>

<Update
  label="Sep 22, 2025"
  tags={["Released"]}
  rss={{
title: "Adding purchased_side to REST and ws fills",
description: "User seeking a simple way to determine the direction of their fill should reference purchased_side. Both BUY YES or SELL NO result in purchased_side = YES. The addition of this field is the first step in standardizing the fills websocket and REST endpoints, which have different conventions for the interpretation 'side' and 'user_action'"
}}
>
  User seeking a simple way to determine the direction of their fill should reference purchased\_side. Both BUY YES or SELL NO result in purchased\_side = YES. The addition of this field is the first step in standardizing the fills websocket and REST endpoints, which have different conventions for the interpretation 'side' and 'user\_action'.

  Expected Enforce Date: deprecation date for existing fields not yet scheduled.
</Update>

<Update
  label="Sep 21, 2025"
  tags={["Released"]}
  rss={{
title: "Scheduled Series Fees API Endpoint",
description: "New endpoint for getting all of a series' scheduled fees"
}}
>
  Added new public API endpoint for getting all of a series' scheduled fees:

  * `GET /series/fee_changes` - Get a series' fee changes. If query string parameter show\_historical is set to true, ALL fee changes previous and upcoming will be shown. If set to false, only upcoming fee changes will be shown
</Update>

<Update
  label="Sep 25, 2025"
  tags={["Breaking Change", "Released"]}
  rss={{
title: "Deprecating order type `market`",
description: "Deprecating order type `market`"
}}
>
  Specifying `order_type` is no longer required and only `limit` type orders will be supported.
  Price must be supplied based on the underlying market structure. Example usage:

  ```
  {"yes_price": 99, "side: "yes"} // buy yes or sell no at market price
  {"no_price": 99, "side: "no"} // buy no or sell yes at market price
  ```

  Expected enforce date: `Sep 25, 2025`
</Update>

<Update
  label="Sep 18, 2025"
  tags={["Breaking change", "Released"]}
  rss={{
title: "Websocket API Session Limit",
description: "Websocket API Session Limit"
}}
>
  WebSocket connections per user are limited by usage tier. The default limit begins at 200 and increases based on API usage tier.
</Update>

<Update
  label="Sep 18, 2025"
  tags={["Released"]}
  rss={{
title: "Communications WS channel",
description: "Streamed RFQs and quotes"
}}
>
  A new WS channel is being introduced for streaming information related to pre-trade communications (RFQs and quotes).
</Update>

<Update
  label="Sep 15, 2025"
  tags={["Released"]}
  rss={{
title: "Additional RFQ and market metadata",
description: "MVE related meatadata"
}}
>
  Additional metadata is being added to RFQs on multivarate events (MVEs) that break down their component parts explicitly. Market payloads are also being expanded with these new optional fields that are filled only for MVE markets.
</Update>

<Update
  label="Sep 15, 2025"
  tags={["Released"]}
  rss={{
title: "Event Candlesticks API Endpoint",
description: "New endpoint for getting event candlesticks"
}}
>
  Added new public API endpoint for event candlesticks:

  * `GET /candlesticks` - Get candlesticks for all markets associated with an event. If the # of candlesticks exceeds 5000, paginate the results and return an adjustedEndTs which should be used as the start\_ts for your next request.
</Update>

<Update
  label="Sept 11, 2025"
  tags={["SDK", "Released"]}
  rss={{
title: "TypeScript SDK Release",
description: "Official TypeScript SDK now available via NPM"
}}
>
  The TypeScript SDK is now available through NPM! Install with `npm install kalshi-typescript`.

  Documentation and examples available at docs.kalshi.com
</Update>

<Update
  label="Sep 11, 2025"
  tags={["Released"]}
  rss={{
title: "Forecast Percentiles History API Endpoint",
description: "New endpoint for getting forecast percentiles history"
}}
>
  Added new public API endpoint for forecast percentiles history:

  * `GET /forecast_percentiles_history` - Get percentile history of a event forecast
</Update>

<Update
  label="Sep 10, 2025"
  tags={["Released"]}
  rss={{
title: "Incentive Programs API Endpoint",
description: "New endpoint for retrieving incentive program information"
}}
>
  Added new public API endpoint for incentive programs (not yet live):

  * `GET /incentive_programs` - List incentive programs with filtering options (by market ticker, active status, payout status)
</Update>

<Update
  label="Sep 9, 2025"
  tags={["Released"]}
  rss={{
title: "Subpenny pricing added to websocket",
description: "Subpenny pricing added to websocket"
}}
>
  Subpenny pricing fields have been added to websocket messages. Any message bearing price in cents will now also bear
  an equivalent fixed-point dollars field.

  For more info, see [Subpenny Pricing](/getting_started/subpenny_pricing).
</Update>

<Update
  label="Sep 9, 2025"
  tags={["Released"]}
  rss={{
title: "Events endpoints now return broker availability",
description: "Events endpoints now return broker availabilit"
}}
>
  Both the individual and batch `GET` events endpoints now also return `available_on_brokers` which indicates that they are available on intermediate platforms/ brokers.
</Update>

<Update
  label="Sep 6, 2025"
  tags={["Breaking Change", "Released"]}
  rss={{
title: "Python SDK",
description: "Python SDK"
}}
>
  The python SDK is being generated from our OpenAPI spec and is available through pip with pip install kalshi-python.
  Docs for the new SDK are available on docs.kalshi.com/python-sdk.
</Update>

<Update
  label="Aug 31, 2025"
  tags={["Breaking Change", "Released"]}
  rss={{
title: "Exposing read-only subpenny pricing",
description: "Exposing read-only subpenny pricing in the API."
}}
>
  Subpenny pricing fields have been added to APIs involving price, fees, and money in general.
  E.g. next to a field called `"price": 12` (representing 12 cents), you will also see `"price_dollars": "0.1200"`,
  which is a string bearing a fixed-point representation of money accuate to at 4 decimal points.

  For now, this change is read-only, meaning that the minimum allowable tick size for orders is still 1c. Eventually,
  we will introduce sub-penny pricing on orders. For now, please prepare for an eventual migration to the higher granularity
  price representation.

  For more info, see [Subpenny Pricing](/getting_started/subpenny_pricing).
</Update>

<Update
  label="Sep 2, 2025"
  tags={["Released"]}
  rss={{
title: "New Market Fields for Multivariate Event Collections",
description: "Optional fields added to describe markets that are part of MVEs"
}}
>
  The market payload has been updated to include two new fields that describe markets which are part of Multivariate Events.
</Update>

<Update
  label="Sep 2, 2025"
  tags={["Released"]}
  rss={{
title: "New Market Fields for Multivariate Event Collections",
description: "Optional fields added to describe markets that are part of MVEs"
}}
>
  The market payload has been updated to include two new fields that describe markets which are part of Multivariate Events.
</Update>

<Update
  label="Aug 21, 2025"
  tags={["Released"]}
  rss={{
title: "Multivariate Event Collections Extension",
description: "The MVE payload has been expanded to support more flexible structures."
}}
>
  The MVE payload has been expanded to support more flexible structures. Several fields that are now redundant are deprecated, but not yet removed.
</Update>

<Update
  label="Aug 21, 2025"
  tags={["New Feature", "Released"]}
  rss={{
title: "Settlement value added to Settlements API",
description: "Settlement value added to Settlements API."
}}
>
  The Settlements API now includes the settlement value for a yes contract.
</Update>

<Update
  label="Aug 21, 2025"
  tags={["Bug Fix", "Released"]}
  rss={{
title: "Case-insensitive category filtering for milestones",
description: "Fixed get_milestones endpoint to use case-insensitive matching for the category parameter."
}}
>
  The get\_milestones endpoint now uses case-insensitive matching for the category parameter, resolving inconsistent filtering behavior between "Sports" and "sports".
</Update>

<Update
  label="Aug 14, 2025"
  tags={["New Feature", "Released"]}
  rss={{
title: "Additional Events and Series Filters",
description: "Filtering events by close ts and series by tags supported in the API."
}}
>
  Filtering events by close ts and series by tags supported in the API.
</Update>

<Update
  label="Aug 13, 2025"
  tags={["Released"]}
  rss={{
title: "Batch endpoints now available to all users in demo environment",
description: "BatchCreateOrders and BatchCancelOrders endpoints are now accessible to Basic tier users in the demo environment for testing purposes."
}}
>
  The batch order endpoints are now available to all API users in the demo environment:

  **Affected Endpoints:**

  * `POST /portfolio/orders/batched` (BatchCreateOrders)
  * `DELETE /portfolio/orders/batched` (BatchCancelOrders)

  **Changes:**

  * Basic tier users can now access batch endpoints in demo environment
  * Production environment remains unchanged - Advanced tier or higher still required
  * Rate limits still apply based on user tier

  This change enables developers to test batch order functionality without needing Advanced tier access in the demo environment.
</Update>

<Update
  label="Aug 13, 2025"
  tags={["Documentation", "Released"]}
  rss={{
title: "API Signing Error Messages Improved",
description: "The error messages when an incorrect API signature is passed have been improved"
}}
>
  The error messages when an incorrect API signature is passed have been improved
</Update>

<Update
  label="Aug 9, 2025"
  tags={["Documentation", "Released"]}
  rss={{
title: "OpenAPI Specification Now Available",
description: "The OpenAPI specification is now available for download at docs.kalshi.com/openapi.yaml"
}}
>
  The OpenAPI specification for the Kalshi API is now available at `https://docs.kalshi.com/openapi.yaml`. This allows developers to easily generate client libraries and integrate with the API using OpenAPI-compatible tools.
</Update>

<Update
  label="Aug 8, 2025"
  tags={["Released", "New Feature"]}
  rss={{
title: "Added client_order_id to orderbook delta messages",
description: "Orderbook delta WebSocket messages now include client_order_id field when the change is caused by your own order."
}}
>
  Added `client_order_id` field to orderbook delta WebSocket messages. This field appears only when you caused the orderbook change and contains the client\_order\_id of your order that triggered the delta.

  **WebSocket Message Enhancement:**

  * New field: `client_order_id` (string, optional)
  * Present only when the authenticated user's order causes the orderbook change
  * Contains the client-provided order ID of the triggering order

  See the WebSocket documentation for implementation details.
</Update>

<Update
  label="Aug 1, 2025"
  tags={["Released", "New Feature"]}
  rss={{
title: "Added GetOrderQueuePositions Endpoint",
description: "New endpoint for retrieving queue positions for multiple orders in a single request."
}}
>
  Added `GET /portfolio/orders/queue_positions` endpoint for retrieving queue positions of multiple resting orders.

  **Request Parameters:**

  * `market_tickers` (optional): Array of market tickers to filter by
  * `event_ticker` (optional): Event ticker to filter by

  Note: You must specify one of `market_tickers` and `event_ticker` in the request.
</Update>

<Update
  label="July 31, 2025"
  tags={["Released", "Breaking Change", "Documentation"]}
  rss={{
title: "Documentation and RSS Feed Migration",
description: "RSS feed moved from trading-api.readme.io/changelog.rss to docs.kalshi.com/changelog/rss.xml. The trading-api.readme.io site is deprecated - use docs.kalshi.com instead."
}}
>
  We are migrating our API documentation to a new platform:

  * **RSS feed moved** from `https://trading-api.readme.io/changelog.rss` to `https://docs.kalshi.com/changelog/rss.xml`
  * **Documentation site** `trading-api.readme.io` is now deprecated
  * **New documentation home**: `https://docs.kalshi.com`
  * Historical changelog entries will not be backfilled to the new RSS feed

  Please update your bookmarks and RSS subscriptions.
</Update>

<Update
  label="July 31, 2025"
  tags={["Released"]}
  rss={{
title: "Additional event metadata",
description: "The GetEventMetadata endpoint has been expanded to include settlement sources."
}}
>
  The GetEventMetadata endpoint has been expanded to include settlement sources.
</Update>

<Update
  label="July 29, 2025"
  tags={["Released", "Breaking Change"]}
  rss={{
title: "Removed API versioning",
description: "The GetApiVersion endpoint has been removed. API versioning will not be available for the time being."
}}
>
  The GetApiVersion endpoint has been removed. API versioning will not be available for the time being.
</Update>


### Getting Started / Welcome

+----+-----------------------------------------------+
| No | Page                                          |
+----+-----------------------------------------------+
| 1  | /getting_started/making_your_first_request.md |
| 2  | /getting_started/quick_start_market_data.md   |
+----+-----------------------------------------------+

### /getting_started/making_your_first_request.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Making Your First Request

> Start trading with Kalshi API in under 5 minutes

To make your request we recommend testing a public endpoint like [GetMarkets](https://docs.kalshi.com/api-reference/market/get-markets). As you explore our other endpoints, you'll notice some endpoints return an authentication\_error. If you want to experiment with these endpoints, you will need to get [API Keys](https://docs.kalshi.com/getting_started/api_keys). You may also want to sign up for a demo account to test without real funds.

The following resources might help you on your journey to exploring Kalshi's markets:

* [**Quick Start: Market Data (No SDK)**](/getting_started/quick_start_market_data)
* [**Quick Start: Authenticated Requests (No SDK)**](/getting_started/quick_start_authenticated_requests)
* [**Discord**](https://discord.gg/kalshi) and check out #dev and #support

### /getting_started/quick_start_market_data.md

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.kalshi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Quick Start: Market Data (No SDK)

> Learn how to access real-time market data without authentication

This guide will walk you through accessing Kalshi's public market data endpoints without authentication. You'll learn how to retrieve series information, events, markets, and orderbook data for the popular "Who will have a higher net approval" market.

## Making Unauthenticated Requests

Kalshi provides several public endpoints that don't require API keys. These endpoints allow you to access market data directly from our production servers at `https://api.elections.kalshi.com/trade-api/v2`.

<Info>
  **Note about the API URL**: Despite the "elections" subdomain, `api.elections.kalshi.com` provides access to ALL Kalshi markets - not just election-related ones. This includes markets on economics, climate, technology, entertainment, and more.
</Info>

<Info>
  No authentication headers are required for the endpoints in this guide. You can start making requests immediately!
</Info>

## Step 1: Get Series Information

Let's start by fetching information about the KXHIGHNY series ([Highest temperature in NYC today?](https://kalshi.com/markets/kxhighny/highest-temperature-in-nyc)). This series tracks the highest temperature recorded in Central Park, New York on a given day. We'll use the [Get Series](/api-reference/market/get-series) endpoint.

<CodeGroup>
  ```python Python theme={null}
  import requests

  # Get series information for KXHIGHNY
  url = "https://api.elections.kalshi.com/trade-api/v2/series/KXHIGHNY"
  response = requests.get(url)
  series_data = response.json()

  print(f"Series Title: {series_data['series']['title']}")
  print(f"Frequency: {series_data['series']['frequency']}")
  print(f"Category: {series_data['series']['category']}")
  ```

  ```javascript JavaScript theme={null}
  // Get series information for KXHIGHNY
  fetch('https://api.elections.kalshi.com/trade-api/v2/series/KXHIGHNY')
    .then(response => response.json())
    .then(data => {
      console.log(`Series Title: ${data.series.title}`);
      console.log(`Frequency: ${data.series.frequency}`);
      console.log(`Category: ${data.series.category}`);
    });
  ```

  ```curl cURL theme={null}
  curl -X GET "https://api.elections.kalshi.com/trade-api/v2/series/KXHIGHNY"
  ```
</CodeGroup>

## Step 2: Get Today's Events and Markets

Now that we have the series information, let's get the markets for this series. We'll use the [Get Markets](/api-reference/market/get-markets) endpoint with the series ticker filter to find all active markets. If there are no open markets today, remove `status=open` or use `status=all` to see the full series history.

<CodeGroup>
  ```python Python theme={null}
  # Get all open markets for the KXHIGHNY series
  markets_url = f"https://api.elections.kalshi.com/trade-api/v2/markets?series_ticker=KXHIGHNY&status=open"
  markets_response = requests.get(markets_url)
  markets_data = markets_response.json()

  print(f"\nActive markets in KXHIGHNY series:")
  for market in markets_data['markets']:
      print(f"- {market['ticker']}: {market['title']}")
      print(f"  Event: {market['event_ticker']}")
      print(f"  Yes Price: {market['yes_price']}¢ | Volume: {market['volume']}")
      print()

  # Get details for a specific event if you have its ticker
  if markets_data['markets']:
      # Let's get details for the first market's event
      event_ticker = markets_data['markets'][0]['event_ticker']
      event_url = f"https://api.elections.kalshi.com/trade-api/v2/events/{event_ticker}"
      event_response = requests.get(event_url)
      event_data = event_response.json()

      print(f"Event Details:")
      print(f"Title: {event_data['event']['title']}")
      print(f"Category: {event_data['event']['category']}")
  ```

  ```javascript JavaScript theme={null}
  // Get markets for the KXHIGHNY series
  async function getSeriesMarkets() {
    // Get all open markets for this series
    const marketsResponse = await fetch('https://api.elections.kalshi.com/trade-api/v2/markets?series_ticker=KXHIGHNY&status=open');
    const marketsData = await marketsResponse.json();

    console.log('\nActive markets in KXHIGHNY series:');
    marketsData.markets.forEach(market => {
      console.log(`- ${market.ticker}: ${market.title}`);
      console.log(`  Event: ${market.event_ticker}`);
      console.log(`  Yes Price: ${market.yes_price}¢ | Volume: ${market.volume}`);
      console.log();
    });

    // Get details for a specific event if markets exist
    if (marketsData.markets.length > 0) {
      const eventTicker = marketsData.markets[0].event_ticker;
      const eventResponse = await fetch(`https://api.elections.kalshi.com/trade-api/v2/events/${eventTicker}`);
      const eventData = await eventResponse.json();

      console.log('Event Details:');
      console.log(`Title: ${eventData.event.title}`);
      console.log(`Category: ${eventData.event.category}`);
    }
  }

  getSeriesMarkets();
  ```
</CodeGroup>

<Info>
  You can view these markets in the Kalshi UI at: [https://kalshi.com/markets/kxhighny](https://kalshi.com/markets/kxhighny)
</Info>

## Step 3: Get Orderbook Data

Now let's fetch the orderbook for a specific market to see the current bids and asks using the [Get Market Orderbook](/api-reference/market/get-market-order-book) endpoint. This snippet assumes you still have the `markets_data` from the previous step. If `markets_data['markets']` is empty, pick a market from a different series or remove the `status=open` filter.

<CodeGroup>
  ```python Python theme={null}
  # Get orderbook for a specific market
  # Replace with an actual market ticker from the markets list
  if not markets_data['markets']:
      raise ValueError("No open markets found. Try removing status=open or choose another series.")

  market_ticker = markets_data['markets'][0]['ticker']
  orderbook_url = f"https://api.elections.kalshi.com/trade-api/v2/markets/{market_ticker}/orderbook"

  orderbook_response = requests.get(orderbook_url)
  orderbook_data = orderbook_response.json()

  print(f"\nOrderbook for {market_ticker}:")
  print("YES BIDS:")
  for bid in orderbook_data['orderbook']['yes'][:5]:  # Show top 5
      print(f"  Price: {bid[0]}¢, Quantity: {bid[1]}")

  print("\nNO BIDS:")
  for bid in orderbook_data['orderbook']['no'][:5]:  # Show top 5
      print(f"  Price: {bid[0]}¢, Quantity: {bid[1]}")
  ```

  ```javascript JavaScript theme={null}
  // Get orderbook data
  async function getOrderbook(marketTicker) {
    const response = await fetch(`https://api.elections.kalshi.com/trade-api/v2/markets/${marketTicker}/orderbook`);
    const data = await response.json();

    console.log(`\nOrderbook for ${marketTicker}:`);
    console.log('YES BIDS:');
    data.orderbook.yes.slice(0, 5).forEach(([price, quantity]) => {
      console.log(`  Price: ${price}¢, Quantity: ${quantity}`);
    });

    console.log('\nNO BIDS:');
    data.orderbook.no.slice(0, 5).forEach(([price, quantity]) => {
      console.log(`  Price: ${price}¢, Quantity: ${quantity}`);
    });
  }
  ```
</CodeGroup>

## Working with Large Datasets

The Kalshi API uses cursor-based pagination to handle large datasets efficiently. To learn more about navigating through paginated responses, see our [Understanding Pagination](/getting_started/pagination) guide.

## Understanding Orderbook Responses

Kalshi's orderbook structure is unique due to the nature of binary prediction markets. The API only returns bids (not asks) because of the reciprocal relationship between YES and NO positions. To learn more about orderbook responses and why they work this way, see our [Orderbook Responses](/getting_started/orderbook_responses) guide.

## Next Steps

Now that you understand how to access market data without authentication, you can:

1. Explore other public series and events
2. Build real-time market monitoring tools
3. Create market analysis dashboards
4. Set up a WebSocket connection for live updates (requires authentication)

For authenticated endpoints that allow trading and portfolio management, check out our [API Keys guide](/getting_started/api_keys).


