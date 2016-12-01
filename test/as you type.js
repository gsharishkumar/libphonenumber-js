import chai, { expect } from 'chai'
chai.should()

import as_you_type, { close_dangling_braces, repeat } from '../source/as you type'

describe('as you type', () =>
{
	it('should parse and format phone numbers as you type', function()
	{
		// International number test
		new as_you_type().input('+12133734').should.equal('+1 213 373 4')
		// Local number test
		new as_you_type('US').input('2133734').should.equal('(213) 373-4')

		// With national prefix test
		new as_you_type('RU').input('88005553535').should.equal('8 (800) 555-35-35')
		new as_you_type('RU').input('8800555353').should.equal('8 (800) 555-35-3')

		new as_you_type('CH').input('044-668-1').should.equal('044 668 1')

		let formatter

		// Test International phone number (USA)

		formatter = new as_you_type()

		formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		type(formatter.formatter).should.equal('undefined')

		formatter.input('+').should.equal('+')

		formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		type(formatter.formatter).should.equal('undefined')
		formatter.input('1').should.equal('+1')

		formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		type(formatter.formatter).should.equal('undefined')

		formatter.input('2').should.equal('+1 2')

		formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		type(formatter.formatter).should.equal('undefined')

		formatter.input('1').should.equal('+1 21')
		formatter.input('3').should.equal('+1 213')
		formatter.input(' ').should.equal('+1 213')
		formatter.input('3').should.equal('+1 213 3')
		formatter.input('3').should.equal('+1 213 33')
		formatter.input('3').should.equal('+1 213 333')
		formatter.input('4').should.equal('+1 213 333 4')
		formatter.input('4').should.equal('+1 213 333 44')
		formatter.input('4').should.equal('+1 213 333 444')

		formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		type(formatter.formatter).should.equal('undefined')

		formatter.input('4').should.equal('+1 213 333 4444')

		formatter.valid.should.be.true
		formatter.country.should.equal('US')
		// This one below contains "punctuation spaces"
		// along with the regular spaces
		formatter.template.should.equal('+x xxx xxx xxxx')

		formatter.input('5').should.equal('+121333344445')

		formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		type(formatter.formatter).should.equal('undefined')

		// Check that clearing an international formatter
		// also clears country metadata.

		formatter.reset()

		formatter.input('+').should.equal('+')
		formatter.input('7').should.equal('+7')
		formatter.input('9').should.equal('+7 9')
		formatter.input('99 111 22 33').should.equal('+7 999 111 22 33')

		// Test Switzerland phone numbers

		formatter = new as_you_type('CH')

		formatter.input(' ').should.equal('')
		formatter.input('0').should.equal('0')
		formatter.input('4').should.equal('04')
		formatter.input(' ').should.equal('04')
		formatter.input('-').should.equal('04')
		formatter.input('4').should.equal('044')
		formatter.input('-').should.equal('044')
		formatter.input('6').should.equal('044 6')
		formatter.input('6').should.equal('044 66')
		formatter.input('8').should.equal('044 668')
		formatter.input('-').should.equal('044 668')
		formatter.input('1').should.equal('044 668 1')
		formatter.input('8').should.equal('044 668 18')
		formatter.input(' 00').should.equal('044 668 18 00')
		formatter.input('9').should.equal('04466818009')

		// Test Russian phone numbers
		// (with optional national prefix `8`)

		formatter = new as_you_type('RU')

		formatter.input('8').should.equal('8')
		formatter.input('9').should.equal('8 (9  )')
		formatter.input('9').should.equal('8 (99 )')
		formatter.input('9').should.equal('8 (999)')
		formatter.input('-').should.equal('8 (999)')
		formatter.input('1234').should.equal('8 (999) 123-4')
		formatter.input('567').should.equal('8 (999) 123-45-67')
		formatter.input('8').should.equal('899912345678')

		// Check that clearing an national formatter:
		//  * doesn't clear country metadata
		//  * clears all other things

		formatter.reset()

		formatter.input('8').should.equal('8')
		formatter.input('9').should.equal('8 (9  )')
		formatter.input('9').should.equal('8 (99 )')
		formatter.input('9').should.equal('8 (999)')
		formatter.input('-').should.equal('8 (999)')
		formatter.input('1234').should.equal('8 (999) 123-4')
		formatter.input('567').should.equal('8 (999) 123-45-67')
		formatter.input('8').should.equal('899912345678')

		// National prefix should not be prepended
		// when formatting local NANPA phone numbers.
		new as_you_type('US').input('1').should.equal('1')
		new as_you_type('US').input('12').should.equal('(2  )')
		new as_you_type('US').input('123').should.equal('(23 )')
	})

	it('should close dangling braces', function()
	{
		close_dangling_braces('(9)', 2).should.equal('(9)')

		let formatter

		// Test braces (US)

		formatter = new as_you_type('US')

		formatter.input('9').should.equal('(9  )')
		formatter.input('9').should.equal('(99 )')
		formatter.input('9').should.equal('(999)')
		formatter.input('1').should.equal('(999) 1')

		// Test braces (RU)

		formatter = new as_you_type('RU')

		formatter.input('8').should.equal('8')
		formatter.input('9').should.equal('8 (9  )')
		formatter.input('9').should.equal('8 (99 )')
		formatter.input('9').should.equal('8 (999)')
		formatter.input('1').should.equal('8 (999) 1')
	})

	it('should work in edge cases', function()
	{
		let formatter

		// Second '+' sign

		formatter = new as_you_type('RU')

		formatter.input('+').should.equal('+')
		formatter.input('7').should.equal('+7')
		formatter.input('+').should.equal('+7')

		// Out-of-position '+' sign

		formatter = new as_you_type('RU')

		formatter.input('8').should.equal('8')
		formatter.input('+').should.equal('8')

		// No format matched

		formatter = new as_you_type('RU')

		formatter.input('88005553535').should.equal('8 (800) 555-35-35')
		formatter.input('0').should.equal('880055535350')

		// Invalid country phone code

		formatter = new as_you_type()

		formatter.input('+0123').should.equal('+0123')

		// Explicitly set country and derived country conflict

		formatter = new as_you_type('RU')

		formatter.input('+123').should.equal('+123')

		// No country specified and not an international number

		formatter = new as_you_type()

		formatter.input('88005553535').should.equal('88005553535')

		// Extract national prefix when no `national_prefix` is set

		formatter = new as_you_type('AD')

		formatter.input('155555').should.equal('155 555')

		// Typing nonsense

		formatter = new as_you_type('RU')

		formatter.input('+1abc2').should.equal('')
	})

	it('should repeat string N times', function()
	{
		repeat('a', 0).should.equal('')
		repeat('a', 3).should.equal('aaa')
		repeat('a', 4).should.equal('aaaa')
	})
})

function type(something)
{
	return typeof something
}