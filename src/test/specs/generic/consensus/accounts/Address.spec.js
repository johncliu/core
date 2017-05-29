describe('Address', () => {

    it('is 20 bytes long', () => {
        const address = new Address(Dummy.address1);
        expect(address.serializedSize).toEqual(20);
        expect(() => {
            const sign = new Address(new ArrayBuffer(16));
        }).toThrow('Primitive: Invalid length');

        expect(() => {
            const sign = new Address('test');
        }).toThrow('Primitive: Invalid length');

        expect(() => {
            const sign = new Address(new ArrayBuffer(33));
        }).toThrow('Primitive: Invalid length');
    });

    it('is serializable and unserializable', () => {
        const address1 = new Address(Dummy.address1);
        const address2 = Address.unserialize(address1.serialize());

        expect(address2.toBase64()).toBe(Dummy.address1, 'because of ' +
            'invariance.');
    });

    it('only accepts valid base64 addresses', () => {
        function formatChars(charSet) {
            return Array.from(charSet)  // convert to array
              .map(charCode => `${String.fromCharCode(charCode)  }(${  charCode 
              })`)                      // append index
              .join(', ');              // create string
        }

        // valid base64 chars + extensions for file and url encoding
        // = is NOT whitelisted here since it is only allowed for padding
        base64Whitelist = '+-/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefg' +
            'hijklmnopqrstuvwxyz';
        validChars = new Set(base64Whitelist.split(''));

        let base = Dummy.address1;

        const falsePositives = new Set();
        const falseNegatives = new Set();

        // test all possible characters
        for (let i = 0; i < 256; i++) {
            const character = String.fromCharCode(i);
            // insert at position 1
            base = base.substring(0, 1) + character + base.substring(2);

            const valid = validChars.has(character);
            let fail = false;
            try {
                new Address(base);
            } catch (e) {
                fail = true;
            }

            if (valid && fail) {
                falsePositives.add(i);
            } else if (!valid && !fail) {
                falseNegatives.add(i);
            }
        }

        const falsePositivesSize = falsePositives.size;
        const falseNegativesSize = falseNegatives.size;

        let error = '';
        if (falsePositivesSize > 0 || falseNegativesSize > 0) {
            error = 'Error during Address creation:\n';
            if (falsePositivesSize > 0) {
                error += `The following valid base64 characters were rejected: ${ 
                formatChars(falsePositives)}`;
            }
            if (falseNegativesSize > 0) {
                error += `${'The following invalid base64 characters were ' +
                'accepted: '}${  formatChars(falseNegatives)}`;
            }
        }

        expect(error).toEqual('');

    });

    it('has an equals method', () => {
        const address1 = new Address(Dummy.address1);
        const address2 = new Address(Dummy.address2);

        expect(address1.equals(address1))
            .toBe(true,'because address1 == address1');
        expect(address1.equals(address2))
            .toBe(false,'because address1 !== address2');
        expect(address1.equals(null))
            .toBe(false,'because address1 !== null');
        expect(address1.equals(1))
            .toBe(false,'because address1 !== 1');
    });
});
