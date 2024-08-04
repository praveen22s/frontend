import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { differenceInCalendarDays } from 'date-fns';
import DateRangePicker from 'components/ux/data-range-picker/DateRangePicker';
import { networkAdapter } from 'services/NetworkAdapter';
import { DEFAULT_TAX_DETAILS } from 'utils/constants';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { formatPrice } from 'utils/price-helpers';
import Toast from 'components/ux/toast/Toast';
import format from 'date-fns/format';

import LockIcon from '@mui/icons-material/Lock';
import WifiIcon from '@mui/icons-material/Wifi';
import PoolIcon from '@mui/icons-material/Pool';
import SpaIcon from '@mui/icons-material/Spa';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import FireExtinguisherIcon from '@mui/icons-material/FireExtinguisher';
import SecurityIcon from '@mui/icons-material/Security';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import PetsIcon from '@mui/icons-material/Pets';
import AccessibleIcon from '@mui/icons-material/Accessible';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MovieIcon from '@mui/icons-material/Movie';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import RoomServiceIcon from '@mui/icons-material/RoomService';

import PeopleIcon from '@mui/icons-material/People';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ElevatorIcon from '@mui/icons-material/Elevator';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import PowerIcon from '@mui/icons-material/Power';
/**
 * A component that displays the booking details for a hotel, including date range, room type, and pricing.
 *
 * @param {Object} props - The component's props.
 * @param {string} props.hotelCode - The unique code for the hotel.
 */
const HotelBookingDetailsCard = ({ hotelCode }) => {
  // State for date picker visibility
  const [isDatePickerVisible, setisDatePickerVisible] = useState(false);

  const navigate = useNavigate();

  // State for error message
  const [errorMessage, setErrorMessage] = useState('');

  // State for date range
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection',
    },
  ]);

  // State for selected room, guests, and rooms
  const [selectedRoom, setSelectedRoom] = useState({
    value: 'Marriage',
    label: 'Marriage',
  });
  const [selectedGuests, setSelectedGuests] = useState({
    value: 2,
    label: '2 guests',
  });
  const [selectedRooms, setSelectedRooms] = useState({
    value: 1,
    label: '1 room',
  });

  // State for pricing and booking details
  const [total, setTotal] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [bookingPeriodDays, setBookingPeriodDays] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({});

  // Options for guests and rooms
  const guestOptions = Array.from(
    { length: bookingDetails.maxGuestsAllowed },
    (_, i) => ({ value: i + 1, label: `${i + 1} guest` })
  );
  const roomNumberOptions = Array.from(
    { length: bookingDetails.maxRoomsAllowedPerGuest },
    (_, i) => ({ value: i + 1, label: `${i + 1} room` })
  );
  const roomOptions = [
    {
      value: 'Birthday',
      label: 'Birthday',
    },
    {
      value: 'party',
      label: 'Party',
    },
    {
      value: 'Marriage',
      label: 'Marriage',
    },
    {
      value: 'Conferance',
      label: 'Conferance',
    },
    {
      value: 'Baby shower',
      label: 'Baby shower',
    },
    {
      value: 'Puberty ceremony',
      label: 'Puberty ceremony',
    },
  ];

  // Handlers for select changes
  const handleRoomTypeChange = (selectedOption) => {
    setSelectedRoom(selectedOption);
    calculatePrices();
  };
  const handleGuestsNumberChange = (selectedOption) => {
    setSelectedGuests(selectedOption);
  };
  const handleRoomsNumberChange = (selectedOption) => {
    setSelectedRooms(selectedOption);
    calculatePrices();
  };

  // Handler for date picker visibility toggle
  const onDatePickerIconClick = () => {
    setisDatePickerVisible(!isDatePickerVisible);
  };

  /**
   * Handler for date range changes. Updates the booking period days and recalculates prices.
   *
   * @param {Object} ranges - The selected date ranges.
   */
  const onDateChangeHandler = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
    const days =
      startDate && endDate
        ? differenceInCalendarDays(endDate, startDate) + 1
        : 1;
    setBookingPeriodDays(days);
    calculatePrices();
  };

  /**
   * Calculates the total price and taxes based on the selected room and booking period.
   */
  const calculatePrices = () => {
    const pricePerNight = bookingDetails.currentNightRate * selectedRooms.value;
    const gstRate =
      pricePerNight <= 2500 ? 0.12 : pricePerNight > 7500 ? 0.18 : 0.12;
    const totalGst = (pricePerNight * bookingPeriodDays * gstRate).toFixed(2);
    const totalPrice = (
      pricePerNight * bookingPeriodDays +
      parseFloat(totalGst)
    ).toFixed(2);
    if (!isNaN(totalPrice)) {
      setTotal(`${formatPrice(totalPrice)} INR`);
    }
    setTaxes(`${formatPrice(totalGst)} INR`);
  };

  const onBookingConfirm = () => {
    if (!dateRange[0].startDate || !dateRange[0].endDate) {
      setErrorMessage('Please select check-in and check-out dates.');
      return;
    }
    const checkIn = format(dateRange[0].startDate, 'dd-MM-yyyy');
    const checkOut = format(dateRange[0].endDate, 'dd-MM-yyyy');
    const queryParams = {
      hotelCode,
      checkIn,
      checkOut,
      guests: selectedGuests.value,
      rooms: selectedRooms.value,
      hotelName: bookingDetails.name.replaceAll(' ', '-'), // url friendly hotel name
    };

    const url = `/checkout?${queryString.stringify(queryParams)}`;
    navigate(url, {
      state: {
        total,
        checkInTime: bookingDetails.checkInTime,
        checkOutTime: bookingDetails.checkOutTime,
      },
    });
  };

  // Handler for dismissing error message
  const dismissError = () => {
    setErrorMessage('');
  };

  // Effect for initial price calculation
  useEffect(() => {
    calculatePrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingPeriodDays, selectedRooms, selectedRoom, bookingDetails]);

  // Effect for fetching booking details
  useEffect(() => {
    const getBookingDetails = async () => {
      const response = await networkAdapter.get(
        `api/hotel/${hotelCode}/booking/enquiry`
      );
      if (response && response.data) {
        setBookingDetails(response.data);
      }
    };
    getBookingDetails();
  }, [hotelCode]);

  return (
    <div className="mx-2 bg-white shadow-xl rounded-xl overflow-hidden mt-2 md:mt-0 w-full md:w-[380px]">
      <div className="px-6 py-4 bg-brand text-white">
        <h2 className="text-xl font-bold">Booking Details</h2>
      </div>
      <div className="p-6 text-sm md:text-base">
        {/* Total Price */}
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-800 mb-1">
            Total Price
          </div>
          <div className="text-xl font-bold text-indigo-600">{total}</div>
          <div className="text-sm text-green-600">
            {bookingDetails.cancellationPolicy}
          </div>
        </div>

        {/* Dates & Time */}
        <div className="mb-4">
          <div className="font-semibold text-gray-800">Dates & Time</div>
          <div className="text-gray-600">
            <DateRangePicker
              isDatePickerVisible={isDatePickerVisible}
              onDatePickerIconClick={onDatePickerIconClick}
              onDateChangeHandler={onDateChangeHandler}
              setisDatePickerVisible={setisDatePickerVisible}
              dateRange={dateRange}
              inputStyle="DARK"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold text-gray-800">Amenities</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <WifiIcon />
              <div style={{ fontSize: '12px' }}>Wifi</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <PoolIcon />
              <div style={{ fontSize: '12px' }}>Pool</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <LockIcon />
              <div style={{ fontSize: '12px' }}>Locker</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <LocalBarIcon />
              <div style={{ fontSize: '12px' }}>Bar</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <FireExtinguisherIcon />
              <div style={{ fontSize: '12px' }}>Fire Extinguisher</div>
            </div>
          </div>
        </div>

        {/* Room Type */}
        <div className="mb-4">
          <div className="font-semibold text-gray-800">Event Type</div>
          <Select
            value={selectedRoom}
            onChange={handleRoomTypeChange}
            options={roomOptions}
          />
        </div>

        {/* Per day rate */}
        <div className="mb-4">
          <div className="font-semibold text-gray-800">Per day rate</div>
          <div className="text-gray-600">
            {formatPrice(bookingDetails.currentNightRate)} INR
          </div>
        </div>

        {/* Taxes */}
        <div className="mb-4">
          <div className="font-semibold text-gray-800">Taxes</div>
          <div className="text-gray-600">{taxes}</div>
          <div className="text-xs text-gray-500">{DEFAULT_TAX_DETAILS}</div>
        </div>

        {errorMessage && (
          <Toast
            type="error"
            message={errorMessage}
            dismissError={dismissError}
          />
        )}
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <button
          onClick={onBookingConfirm}
          className="w-full bg-brand-secondary text-white py-2 rounded hover:bg-yellow-600 transition duration-300"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default HotelBookingDetailsCard;
