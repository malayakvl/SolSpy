import React from 'react';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import ValidatorCard from './ValidatorCard';

interface TopContentCarouselProps {
  topValidatorsData: any[];
  topNewsData: any[];
  epoch: any;
  settingsData: any;
  totalStakeData: any;
  validatorsData: any;
}

export default function TopContentCarousel({ 
  topValidatorsData, 
  topNewsData, 
  epoch, 
  settingsData, 
  totalStakeData,
  validatorsData
}: TopContentCarouselProps) {
  return (
    <div className="flex">
      {/* Top Validators Carousel */}
      <div className="flex items-start mb-6 w-1/2 bg-white p-0 pr-2" style={{ height: '210px' }}>
        <CarouselProvider
          naturalSlideWidth={100}
          naturalSlideHeight={75}
          totalSlides={3}
          className="w-full h-full"
        >
          <Slider className="h-full">
            {topValidatorsData.map(validator => (
              <Slide index={validator.index} key={validator.id}>
                <ValidatorCard
                  validator={validator}
                  epoch={epoch}
                  settingsData={settingsData}
                  totalStakeData={totalStakeData}
                  validators={validatorsData}
                />
              </Slide>
            ))}
          </Slider>
          <div className="flex justify-between items-center mt-2">
            <ButtonBack className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Back
            </ButtonBack>
            <DotGroup 
              dotComponent={({ isSelected, onClick }) => (
                <button
                  onClick={onClick}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    isSelected ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              )}
            />
            <ButtonNext className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Next
            </ButtonNext>
          </div>
        </CarouselProvider>
      </div>
      
      {/* Top News Carousel */}
      <div className="flex items-start mb-6 w-1/2 bg-white p-0 pl-2" style={{ height: '210px' }}>
        <CarouselProvider
          naturalSlideWidth={100}
          naturalSlideHeight={75}
          totalSlides={topNewsData ? Math.ceil(topNewsData.length / 1) : 1}
          className="w-full h-full"
        >
          <Slider className="h-full">
            {topNewsData && topNewsData.length > 0 ? (
              topNewsData.map((newsItem, index) => (
                <Slide index={index} key={`${newsItem.type}-${newsItem.id}`}>
                  <div className="flex items-center justify-center h-[200px]">
                    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-3 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {newsItem.type === 'news' ? 'News' : 'Discord'}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        <a href={newsItem.url} className="hover:text-blue-600">
                          {newsItem.title}
                        </a>
                      </h4>
                      {newsItem.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2 flex-grow">
                          {newsItem.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 mt-auto">
                        {newsItem.source}
                      </div>
                    </div>
                  </div>
                </Slide>
              ))
            ) : (
              <Slide index={0}>
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-8 text-gray-500">
                    No top news available
                  </div>
                </div>
              </Slide>
            )}
          </Slider>
          <div className="flex justify-between items-center mt-2">
            <ButtonBack className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Back
            </ButtonBack>
            <DotGroup 
              dotComponent={({ isSelected, onClick }) => (
                <button
                  onClick={onClick}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    isSelected ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              )}
            />
            <ButtonNext className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Next
            </ButtonNext>
          </div>
        </CarouselProvider>
      </div>
    </div>
  );
}