import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DelhiveryShipmentPayload {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  codAmount: number; // 0 for prepaid
  orderValue: number;
  paymentMode: 'Prepaid' | 'COD';
  weight: number; // grams
  dimensions?: { length: number; breadth: number; height: number };
  productName: string;
  quantity: number;
}

export interface DelhiveryShipmentResult {
  success: boolean;
  waybill?: string;
  trackingUrl?: string;
  shipmentId?: string;
  error?: string;
  raw?: any;
}

@Injectable()
export class DeliveryService {
  private apiKey: string;
  private baseUrl: string;
  private warehouseName: string;
  private readonly logger = new Logger(DeliveryService.name);

  constructor(private config: ConfigService) {
    this.apiKey = config.get<string>('DELHIVERY_API_KEY');
    this.baseUrl = config.get<string>('DELHIVERY_BASE_URL') || 'https://track.delhivery.com';
    this.warehouseName = config.get<string>('DELHIVERY_WAREHOUSE_NAME') || 'Royce Lighting';
  }

  // ─── Create a new shipment ─────────────────────────────────
  async createShipment(payload: DelhiveryShipmentPayload): Promise<DelhiveryShipmentResult> {
    try {
      const shipmentData = {
        shipments: [
          {
            name: payload.customerName,
            add: payload.addressLine1 + (payload.addressLine2 ? `, ${payload.addressLine2}` : ''),
            pin: payload.pinCode,
            city: payload.city,
            state: payload.state,
            country: payload.country || 'India',
            phone: payload.customerPhone,
            order: payload.orderId,
            payment_mode: payload.paymentMode,
            return_pin: '',
            return_city: '',
            return_phone: '',
            return_add: '',
            return_state: '',
            return_country: 'India',
            products_desc: payload.productName,
            hsn_code: '',
            cod_amount: payload.codAmount,
            order_date: payload.orderDate,
            total_amount: payload.orderValue,
            seller_add: '',
            seller_name: this.warehouseName,
            seller_inv: '',
            quantity: String(payload.quantity),
            weight: payload.weight,
            sm_state: '',
            en_state: '',
            actual_weight: payload.weight / 1000, // kg
            products: [
              {
                product_quantity: payload.quantity,
                product_name: payload.productName,
              },
            ],
          },
        ],
        pickup_location: {
          name: this.warehouseName,
        },
      };

      const formData = new URLSearchParams();
      formData.append('format', 'json');
      formData.append('data', JSON.stringify(shipmentData));

      const response = await fetch(`${this.baseUrl}/api/cmu/create.json`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const result = await response.json();
      this.logger.log(`Delhivery create shipment response: ${JSON.stringify(result)}`);

      if (result.packages && result.packages.length > 0) {
        const pkg = result.packages[0];
        if (pkg.waybill) {
          return {
            success: true,
            waybill: pkg.waybill,
            shipmentId: pkg.waybill,
            trackingUrl: `https://www.delhivery.com/track/package/${pkg.waybill}`,
            raw: result,
          };
        }
      }

      return {
        success: false,
        error: result.rmk || result.error || 'Unknown error from Delhivery',
        raw: result,
      };
    } catch (err) {
      this.logger.error(`Delhivery createShipment error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // ─── Track a shipment ──────────────────────────────────────
  async trackShipment(waybill: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/packages/json/?waybill=${waybill}&verbose=true`,
        {
          headers: {
            Authorization: `Token ${this.apiKey}`,
            Accept: 'application/json',
          },
        },
      );
      const result = await response.json();
      return { success: true, data: result };
    } catch (err) {
      this.logger.error(`Delhivery track error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // ─── Cancel a shipment ────────────────────────────────────
  async cancelShipment(waybill: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/p/edit?waybill=${waybill}&cancellation=true`,
        {
          method: 'GET',
          headers: {
            Authorization: `Token ${this.apiKey}`,
          },
        },
      );
      const result = await response.json();
      return { success: true, data: result };
    } catch (err) {
      this.logger.error(`Delhivery cancel error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // ─── Check pincode serviceability ─────────────────────────
  async checkPincode(pincode: string): Promise<{ serviceable: boolean; details?: any }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`,
        {
          headers: {
            Authorization: `Token ${this.apiKey}`,
          },
        },
      );
      const result = await response.json();
      const serviceable = result.delivery_codes && result.delivery_codes.length > 0;
      return { serviceable, details: result };
    } catch (err) {
      this.logger.error(`Delhivery pincode check error: ${err.message}`);
      return { serviceable: false };
    }
  }
}
