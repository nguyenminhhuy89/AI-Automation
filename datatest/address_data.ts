export interface AddressUser {
        firstname: string;
        lastname: string;
        email: string;
        company: string;
        country: string;
        city: string;
        address1: string;
        zipcode: string;
        phonenumber: string;
    }
export class AddressData {
    static getMyAddress(): AddressUser {
        return {
            firstname: 'Tran',
            lastname: 'Loc',
            email: 'test@example.com',
            company: 'FPT Software',
            country: 'Viet Nam',
            city: 'Nha Trang',
            address1: 'Loc Tho',
            zipcode: '57000',
            phonenumber: '0987654321',
        };
    }
}